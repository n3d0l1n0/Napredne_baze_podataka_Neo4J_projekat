using Microsoft.AspNetCore.Mvc;
using StudentMentorAPI.Models;
using StudentMentorAPI.Services;
using Neo4jClient;

namespace StudentMentorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TerminController : ControllerBase
    {
        private readonly Neo4jService _service;

        public TerminController(Neo4jService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<Termin>>> GetAll()
        {
            var client = await _service.GetClientAsync();
            var termini = await client.Cypher
                .Match("(t:Termin)")
                .Return(t => t.As<Termin>())
                .ResultsAsync;
            return Ok(termini);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Termin>> GetById(string id)
        {
            var client = await _service.GetClientAsync();

            var result = await client.Cypher
                .Match("(t:Termin)") 
                .Where((Termin t) => t.id == id)
                .Return(t => t.As<Termin>())
                .ResultsAsync;

            var termin = result.FirstOrDefault();

            if (termin == null)
            {
                return NotFound();
            }

            return Ok(termin);
        }

        [HttpPost]
        public async Task<ActionResult<Termin>> Add([FromBody] Termin termin)
        {
            var client = await _service.GetClientAsync();

            await client.Cypher
                .Create("(t:Termin {id:$id, datum:$datum, vremeOd:$vremeOd, vremeDo:$vremeDo})")
                .WithParams(new
                {
                    id = termin.id,
                    datum = termin.datum,
                    vremeOd = termin.vremeOd,
                    vremeDo=termin.vremeDo
                    
                })
                .ExecuteWithoutResultsAsync();

            return Ok(termin);
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<Termin>> Update([FromBody] Termin termin, string id)
        {
            var client = await _service.GetClientAsync();

            var updated = await client.Cypher
                .Match("(t:Termin)")
                .Where((Termin t) => t.id == id)
                .Set("t.datum = $datum")
                .Set("t.vremeOd = $vremeOd")
                .Set("t.vremeDo = $vremeDo")
                .WithParams(new
                {
                    id = termin.id,
                    datum = termin.datum,
                    vremeOd = termin.vremeOd,
                    vremeDo=termin.vremeDo
                })
                .Return(t => t.As<Termin>())
                .ResultsAsync;

            return Ok(updated.FirstOrDefault());
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var client = await _service.GetClientAsync();
            await client.Cypher
                .Match("(t:Termin)")
                .Where((Termin t) => t.id == id)
                .DetachDelete("t")
                .ExecuteWithoutResultsAsync();
            return NoContent();
        }
    }
}