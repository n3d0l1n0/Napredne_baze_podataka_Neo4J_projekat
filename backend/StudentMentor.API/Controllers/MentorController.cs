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

        //Mentor-CRUD
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

        [HttpGet("all")]
        public async Task<ActionResult<List<Mentor>>> GetAllMentorsAdmin()
        {
            var client = await _service.GetClientAsync();

            var mentors = await client.Cypher
                .Match("(m:Mentor)")
                .Return(m => m.As<Mentor>())
                .ResultsAsync;

            return Ok(mentors.ToList());
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

        //Mentor-Autentifikacija
        [HttpPost("login")]
        public async Task<ActionResult<Mentor>> Login([FromBody] Mentor login)
        {
            var client = await _service.GetClientAsync();

            var result = await client.Cypher
                .Match("(m:Mentor)")
                .Where((Mentor m) => m.email == login.email)
                .Return(m => m.As<Mentor>())
                .ResultsAsync;

            var mentor = result.FirstOrDefault();

            if (mentor == null)
                return Unauthorized("Mentor ne postoji");

            return Ok(mentor);
        }

        //Mentor-Student
        [HttpGet("my-students/{mentorId}")]
        public async Task<ActionResult<List<Student>>> GetMyStudents(string mentorId)
        {
            var client = await _service.GetClientAsync();

            var students = await client.Cypher
                .Match("(m:Mentor)-[:MENTOR_STUDENT]->(s:Student)")
                .Where((Mentor m) => m.id == mentorId)
                .Return(s => s.As<Student>())
                .ResultsAsync;

            return Ok(students.ToList());
        }

        private async Task<string> GetNextStudentId()
        {
            var client = await _service.GetClientAsync();
            var result = await client.Cypher
                .Match("(s:Student)")
                .Return(() => Neo4jClient.Cypher.Return.As<int>("max(toInteger(s.id))"))
                .ResultsAsync;

            int maxId = result.FirstOrDefault();
            return (maxId + 1).ToString();
        }

        [HttpPost("add-student/{mentorId}")]
        public async Task<ActionResult<Student>> AddStudentToMentor(string mentorId, [FromBody] Student student)
        {
            var client = await _service.GetClientAsync();

            student.id = await GetNextStudentId();
            await client.Cypher
                .Match("(m:Mentor)")
                .Where((Mentor m) => m.id == mentorId)
                .Create("(s:Student {id: $id, ime: $ime, prezime: $prezime, email: $email, smer: $smer, godinaStudija: $godinaStudija})")
                .Create("(m)-[:MENTOR_STUDENT]->(s)")
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

        //Mentor-Predmet
        [HttpGet("my-predmeti/{mentorId}")]
        public async Task<ActionResult<List<Predmet>>> GetMyPredmeti(string mentorId)
        {
            var client = await _service.GetClientAsync();

            var predmeti = await client.Cypher
                .Match("(m:Mentor)-[:POKRIVA_PREDMET]->(pred:Predmet)")
                .Where((Mentor m) => m.id == mentorId)
                .Return(pred => pred.As<Predmet>())
                .ResultsAsync;

            return Ok(predmeti.ToList());
        }
        private async Task<string> GetNextPredmetId()
        {
            var client = await _service.GetClientAsync();
            var result = await client.Cypher
                .Match("(p:Predmet)")
                .Return(() => Neo4jClient.Cypher.Return.As<int>("max(toInteger(p.id))"))
                .ResultsAsync;

            int maxId = result.FirstOrDefault();
            return (maxId + 1).ToString();
        }

        [HttpPost("add-predmet/{mentorId}")]
        public async Task<ActionResult<Predmet>> AddPredmetToMentor(string mentorId, [FromBody] Predmet predmet)
        {
            var client = await _service.GetClientAsync();

            predmet.id = await GetNextPredmetId();
            await client.Cypher
                .Match("(m:Mentor)")
                .Where((Mentor m) => m.id == mentorId)
                .Create("(p:Predmet {id: $id, naziv: $naziv, semestar: $semestar})")
                .Create("(m)-[:POKRIVA_PREDMET]->(p)")
                .WithParams(new
                {
                    id = predmet.id,
                    naziv = predmet.naziv,
                    semestar = predmet.semestar
                })
                .ExecuteWithoutResultsAsync();

            return Ok(predmet);
        }

    }
}