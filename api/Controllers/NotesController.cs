using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReferenceArchitecture.Api.Data;
using ReferenceArchitecture.Api.Entities;

namespace ReferenceArchitecture.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Note>>> GetAll()
    {
        var notes = await db.Notes
            .AsNoTracking()
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(notes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Note>> GetById(int id)
    {
        var note = await db.Notes
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id);

        if (note is null)
        {
            return NotFound();
        }

        return Ok(note);
    }

    [HttpPost]
    public async Task<ActionResult<Note>> Create(CreateNoteRequest request)
    {
        var note = new Note
        {
            Title = request.Title,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow,
        };

        db.Notes.Add(note);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = note.Id }, note);
    }
}

public record CreateNoteRequest(string Title, string? Body);