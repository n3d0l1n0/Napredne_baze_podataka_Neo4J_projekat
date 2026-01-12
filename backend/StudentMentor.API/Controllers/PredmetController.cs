using Microsoft.AspNetCore.Mvc;
using StudentMentorAPI.Models;
using StudentMentorAPI.Services;
using Neo4jClient;
using System.Linq;

namespace StudentMentorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PredmetController : ControllerBase
    {
        private readonly Neo4jService _service;

        public PredmetController(Neo4jService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<Predmet>>> GetAll()
        {
            var client = await _service.GetClientAsync();
            var predmeti = await client.Cypher
                .Match("(p:Predmet)")
                .Return(p => p.As<Predmet>())
                .ResultsAsync;
            return Ok(predmeti);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Predmet>> GetById(string id)
        {
            var client = await _service.GetClientAsync();
            var result = await client.Cypher
                .Match("(p:Predmet)")
                .Where((Predmet p) => p.id == id)
                .Return(p => p.As<Predmet>())
                .ResultsAsync;

            var predmet = result.FirstOrDefault();

            if (predmet == null)
            {
                return NotFound();
            }

            return Ok(predmet);
        }

        [HttpPost]
        public async Task<ActionResult<Predmet>> Add([FromBody] Predmet predmet)
        {
            var client = await _service.GetClientAsync();

            // Eksplicitno navođenje parametara
            await client.Cypher
                .Create("(p:Predmet {id: $id, naziv: $naziv, semestar: $semestar})")
                .WithParams(new
                {
                    id = predmet.id,
                    naziv = predmet.naziv,
                    semestar = predmet.semestar
                })
                .ExecuteWithoutResultsAsync();

            return Ok(predmet);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Predmet>> Update([FromBody] Predmet predmet, string id)
        {
            var client = await _service.GetClientAsync();
            
            var result = await client.Cypher
                .Match("(p:Predmet)")
                .Where((Predmet p) => p.id == id)
                .Set("p.naziv = $naziv")
                .Set("p.semestar = $semestar")
                .WithParams(new
                {
                    naziv = predmet.naziv,
                    semestar = predmet.semestar
                })
                .Return(p => p.As<Predmet>())
                .ResultsAsync;

            var updatedPredmet = result.FirstOrDefault();

            if (updatedPredmet == null)
            {
                return NotFound();
            }

            return Ok(updatedPredmet);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var client = await _service.GetClientAsync();
            await client.Cypher
                .Match("(p:Predmet)")
                .Where((Predmet p) => p.id == id)
                .DetachDelete("p")
                .ExecuteWithoutResultsAsync();
            return NoContent();
        }
    }
}