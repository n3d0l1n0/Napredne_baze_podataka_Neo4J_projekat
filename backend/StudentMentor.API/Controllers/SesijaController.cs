using Microsoft.AspNetCore.Mvc;
using StudentMentorAPI.Models;
using StudentMentorAPI.Services;
using Neo4jClient;

namespace StudentMentorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SesijaController : ControllerBase
    {
        private readonly Neo4jService _service;

        public SesijaController(Neo4jService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<Sesija>>> GetAll()
        {
            var client = await _service.GetClientAsync();
            var sesije = await client.Cypher
                .Match("(s:Sesija)")
                .Return(s => s.As<Sesija>())
                .ResultsAsync;
            return Ok(sesije);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sesija>> GetById(string id)
        {
            var client = await _service.GetClientAsync();

            var result = await client.Cypher
                .Match("(s:Sesija)")
                .Where((Sesija s) => s.id == id)
                .Return(s => s.As<Sesija>())
                .ResultsAsync;

            var sesija = result.FirstOrDefault();

            if (sesija == null)
            {
                return NotFound();
            }

            return Ok(sesija);
        }

        [HttpPost]
        public async Task<ActionResult<Sesija>> Add([FromBody] Sesija sesija)
        {
            var client = await _service.GetClientAsync();

            await client.Cypher
                .Create("(s:Sesija {id:$id, opis:$opis, status:$status, ocena:$ocena})")
                .WithParams(new
                {
                    id = sesija.id,
                    opis = sesija.opis,
                    status = sesija.status,
                    ocena = sesija.ocena
                })
                .ExecuteWithoutResultsAsync();

            return Ok(sesija);
        }

        [HttpGet("mentor/{mentorId}")]
        public async Task<ActionResult<List<SesijaDetaljiDTO>>> GetSessionsForMentor(string mentorId)
        {
            var client = await _service.GetClientAsync();

            var result = await client.Cypher
                .Match("(m:Mentor {id: $mentorId})-[:PREDAVAO_POMOC]->(s:Sesija)-[:ZAKAZANA_U]->(t:Termin)")
                .Match("(s)<-[:POHAĐA]-(stud:Student)")
                .OptionalMatch("(s)-[:ZA_PREDMET]->(p:Predmet)")
                .WithParam("mentorId", mentorId)
                .With("s, t, (stud.ime + ' ' + stud.prezime) AS punImeStudenta, " +
                    "coalesce(p.naziv, 'Opšte konsultacije') AS nazivPredmeta")
                .Return((s, t, punImeStudenta, nazivPredmeta) => new SesijaDetaljiDTO
                {
                    SesijaId = s.As<Sesija>().id,
                    Opis = s.As<Sesija>().opis,
                    Status = s.As<Sesija>().status,
                    StudentIme = punImeStudenta.As<string>(),
                    PredmetNaziv = nazivPredmeta.As<string>(),
                    Datum = t.As<Termin>().datum,
                    VremeOd = t.As<Termin>().vremeOd,
                    VremeDo = t.As<Termin>().vremeDo
                })
                .ResultsAsync;

            return Ok(result);
        }
        
        [HttpPost("zakazi")]
        public async Task<ActionResult> CreateFullSession([FromBody] KreirajSesiju dto)
        {
            var client = await _service.GetClientAsync();

            await client.Cypher
                .Match("(m:Mentor {id: $mentorId})", "(st:Student {id: $studentId})", "(p:Predmet {id: $predmetId})")
                .OptionalMatch("(allS:Sesija)")
                .With("m, st, p, count(allS) + 1 AS nextId")
                .Create("(s:Sesija {id: toString(nextId), opis: $opis, status: 'Zakazana'})")
                .Create("(t:Termin {id: 't-' + toString(nextId), datum: $datum, vremeOd: datetime($vremeOd), vremeDo: datetime($vremeDo)})")
                .Create("(m)-[:PREDAVAO_POMOC]->(s)")
                .Create("(st)-[:POHAĐA]->(s)")
                .Create("(s)-[:ZA_PREDMET]->(p)")
                .Create("(s)-[:ZAKAZANA_U]->(t)")
                .WithParams(new {
                    mentorId = dto.MentorId,
                    studentId = dto.StudentId,
                    predmetId = dto.PredmetId,
                    opis = dto.Opis,
                    datum = dto.VremeOd.ToString("yyyy-MM-dd"),
                    vremeOd = dto.VremeOd.ToString("yyyy-MM-ddTHH:mm:ss"),
                    vremeDo = dto.VremeDo.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ExecuteWithoutResultsAsync();

            return Ok();
        }
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateSession(string id, [FromBody] KreirajSesiju dto)
        {
            try 
            {
                var client = await _service.GetClientAsync();

                await client.Cypher
                    .Match("(s:Sesija {id: $id})")
                    .OptionalMatch("(s)-[:ZAKAZANA_U]->(t:Termin)")
                    .Set("s.opis = $opis, s.status = $status")
                    .Set("t.datum = $datum, t.vremeOd = datetime($vremeOd), t.vremeDo = datetime($vremeDo)")
                    .WithParams(new {
                        id = id,
                        opis = dto.Opis ?? "",
                        status = dto.Status ?? "Zakazana",
                        datum = dto.VremeOd.ToString("yyyy-MM-dd"),
                        vremeOd = dto.VremeOd.ToString("yyyy-MM-ddTHH:mm:ss"),
                        vremeDo = dto.VremeDo.ToString("yyyy-MM-ddTHH:mm:ss")
                    })
                    .ExecuteWithoutResultsAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Greška pri ažuriranju: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSession(string id)
        {
            var client = await _service.GetClientAsync();
            await client.Cypher
                .Match("(s:Sesija {id: $id})-[:ZAKAZANA_U]->(t:Termin)")
                .DetachDelete("s, t")
                .WithParam("id", id)
                .ExecuteWithoutResultsAsync();
            return Ok();
        }
    }
}