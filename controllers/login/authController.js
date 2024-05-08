// Register route
//user authentication

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Secret key for JWT
const secretKey = process.env.SECRET_KEY || "w3jRWpyq";

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");

  // Log the actual token value
  console.log("Received token:", token);

  if (!token) {
    console.error("No token provided");
    // return res.status(401).send("Access denied");
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(403).send("Invalid token");
    }

    req.user = user;
  });
  next();
}

async function register(req, res) {
  try {
    const { username, password } = req.body;

    // Validate user data
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = new UserModel({ username, password: hashedPassword });
    await user.save();

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during registration:", error.message);
    return res
      .status(500)
      .json({ error: "Registration failed. Please try again later." });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "8h",
    });

    // Send the token in the "Authorization" header
    return res.header("Authorization", `Bearer ${token}`).json({ token });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Login failed. Please try again later." });
  }
}

async function protected(req, res) {
  console.log(
    "Received token in protected route:",
    req.header("Authorization")
  );
  res.json({ message: "This is a protected route." });
}

module.exports = {
  register,
  login,
  protected,
};
