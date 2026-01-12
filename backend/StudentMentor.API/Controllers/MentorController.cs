using Microsoft.AspNetCore.Mvc;
using StudentMentorAPI.Models;
using StudentMentorAPI.Services;
using Neo4jClient;

namespace StudentMentorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MentorController : ControllerBase
    {
        private readonly Neo4jService _service;

        public MentorController(Neo4jService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<Mentor>>> GetAll()
        {
            var client = await _service.GetClientAsync();
            var mentors = await client.Cypher
                .Match("(m:Mentor)")
                .Return(m => m.As<Mentor>())
                .ResultsAsync;
            return Ok(mentors);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Mentor>> GetById(string id)
        {
            var client = await _service.GetClientAsync();

            var result = await client.Cypher
                .Match("(m:Mentor)") 
                .Where((Mentor m) => m.id == id)
                .Return(m => m.As<Mentor>())
                .ResultsAsync;

            var mentor = result.FirstOrDefault();

            if (mentor == null)
            {
                return NotFound();
            }

            return Ok(mentor);
        }

        [HttpPost]
        public async Task<ActionResult<Mentor>> Add([FromBody] Mentor mentor)
        {
            var client = await _service.GetClientAsync();

            await client.Cypher
                .Create("(m:Mentor {id:$id, ime:$ime, prezime:$prezime, email:$email, rejting:$rejting, tip:$tip})")
                .WithParams(new
                {
                    id = mentor.id,
                    ime = mentor.ime,
                    prezime = mentor.prezime,
                    email = mentor.email,
                    rejting = mentor.rejting,
                    tip = mentor.tip.ToString()
                })
                .ExecuteWithoutResultsAsync();

            return Ok(mentor);
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<Mentor>> Update([FromBody] Mentor mentor, string id)
        {
            var client = await _service.GetClientAsync();

            var updated = await client.Cypher
                .Match("(m:Mentor)")
                .Where((Mentor m) => m.id == id)
                .Set("m += { ime: $ime, prezime: $prezime, email: $email, rejting: $rejting, tip: $tip }")
                .WithParams(new
                {
                    ime = mentor.ime,
                    prezime = mentor.prezime,
                    email = mentor.email,
                    rejting = mentor.rejting,
                    tip = mentor.tip.ToString()
                })
                .Return(m => m.As<Mentor>())
                .ResultsAsync;

            return Ok(updated.FirstOrDefault());
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var client = await _service.GetClientAsync();
            await client.Cypher
                .Match("(m:Mentor)")
                .Where((Mentor m) => m.id == id)
                .DetachDelete("m")
                .ExecuteWithoutResultsAsync();
            return NoContent();
        }
    }
}