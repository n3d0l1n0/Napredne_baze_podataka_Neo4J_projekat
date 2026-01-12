using Microsoft.AspNetCore.Mvc;
using StudentMentorAPI.Models;
using StudentMentorAPI.Services;
using Neo4jClient;

namespace StudentMentorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly Neo4jService _service;

        public StudentController(Neo4jService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<Student>>> GetAll()
        {
            var client = await _service.GetClientAsync();
            var students = await client.Cypher
                .Match("(s:Student)")
                .Return(s => s.As<Student>())
                .ResultsAsync;
            return Ok(students);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetById(string id)
        {
            var client = await _service.GetClientAsync();
            var student = await client.Cypher
                .Match("(s:Student)")
                .Where((Student s) => s.id == id)
                .Return(s => s.As<Student>())
                .ResultsAsync;
            return Ok(student.FirstOrDefault());
        }

        [HttpPost]
        public async Task<ActionResult<Student>> Add([FromBody] Student student)
        {
            var client = await _service.GetClientAsync();

            await client.Cypher
                .Create("(s:Student {id: $id, ime: $ime, prezime: $prezime, email: $email, smer: $smer, godinaStudija: $godinaStudija})")
                .WithParams(new
                {
                    id = student.id,
                    ime = student.ime,
                    prezime = student.prezime,
                    email = student.email,
                    smer = student.smer,
                    godinaStudija = student.godinaStudija
                })
                .ExecuteWithoutResultsAsync();

            return Ok(student);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Student>> Update([FromBody] Student student, string id)
        {
            var client = await _service.GetClientAsync();
            
            var updated = await client.Cypher
                .Match("(s:Student)")
                .Where((Student s) => s.id == id)
                .Set("s.ime = $ime")
                .Set("s.prezime = $prezime")
                .Set("s.email = $email")
                .Set("s.smer = $smer")
                .Set("s.godinaStudija = $godinaStudija")
                .WithParams(new
                {
                    ime = student.ime,
                    prezime = student.prezime,
                    email = student.email,
                    smer = student.smer,
                    godinaStudija = student.godinaStudija
                })
                .Return(s => s.As<Student>())
                .ResultsAsync;
                
            return Ok(updated.FirstOrDefault());
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var client = await _service.GetClientAsync();
            await client.Cypher
                .Match("(s:Student)")
                .Where((Student s) => s.id == id)
                .DetachDelete("s")
                .ExecuteWithoutResultsAsync();
            return NoContent();
        }
    }
}
