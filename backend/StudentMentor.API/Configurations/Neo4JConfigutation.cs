namespace StudentMentorAPI
{
    public class Neo4jConfiguration
    {
        public string? Uri { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }

        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(Uri))
                throw new InvalidOperationException("Neo4j URI is required");
        
            if (string.IsNullOrWhiteSpace(Username))
                throw new InvalidOperationException("Neo4j Username is required");
        
            if (string.IsNullOrWhiteSpace(Password))
                throw new InvalidOperationException("Neo4j Password is required");
        }   

        public static Neo4jConfiguration Local => new()
        {
            Uri = Environment.GetEnvironmentVariable("NEO4J_URI"),
            Username = Environment.GetEnvironmentVariable("NEO4J_USER"),
            Password = Environment.GetEnvironmentVariable("NEO4J_PASSWORD")
        };
    }
}