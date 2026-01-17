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


        [HttpPut("{id}")]
        public async Task<ActionResult<Sesija>> Update([FromBody] Sesija sesija, string id)
        {
            var client = await _service.GetClientAsync();

            var updated = await client.Cypher
                .Match("(s:Sesija)")
                .Where((Sesija s) => s.id == id)
                .Set("s.opis = $opis")
                .Set("s.status = $status")
                .Set("s.ocena = $ocena")
                .WithParams(new
                {
                    id = sesija.id,
                    opis = sesija.opis,
                    status = sesija.status,
                    ocena = sesija.ocena
                })
                .Return(s => s.As<Sesija>())
                .ResultsAsync;

            return Ok(updated.FirstOrDefault());
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var client = await _service.GetClientAsync();
            await client.Cypher
                .Match("(s:Sesija)")
                .Where((Sesija s) => s.id == id)
                .DetachDelete("s")
                .ExecuteWithoutResultsAsync();
            return NoContent();
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
    }
}