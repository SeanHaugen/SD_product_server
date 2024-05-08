const UserModel = require("../../models/userCollection");

//Allow users to take notes
async function postUserNotes(req, res) {
  try {
    const { username } = req.params;
    const { note } = req.body; // Remove currentPage from destructuring

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming user.notes is an array field in the user schema to store notes
    // Assuming you want to add a note without specifying a page
    user.notes.push({ content: note });
    await user.save();

    res.status(201).json({ message: "Note created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getUserNotes(req, res) {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notes = user.notes.map((note) => note.content);

    res.json({ notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function putUserNotes(req, res) {
  try {
    const { userId, currentPage } = req.params;
    const { note } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const targetNote = user.notes.find((n) => n.page === currentPage);

    if (!targetNote) return res.status(404).json({ message: "Note not found" });

    targetNote.note = note;
    await user.save();

    res.json({ message: "Note updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteUserNotes(req, res) {
  try {
    const { username } = req.params;
    const { noteContent } = req.body; // Assuming your frontend sends the note content

    const user = await UserModel.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the index of the note with the specified content
    const noteIndex = user.notes.findIndex(
      (note) => note.content === noteContent
    );

    if (noteIndex === -1) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Remove the note at the specified index
    user.notes.splice(noteIndex, 1);

    await user.save();

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  postUserNotes,
  getUserNotes,
  putUserNotes,
  deleteUserNotes,
};
