const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

//Database
const db = require('./src/DataBase/db');

app.use(cors());   

app.use(express.json());

//Check if server is running
app.get('/', (req, res) => {
    res.send('Server is running!');
});

//Sign up users
app.post('/signup', (req, res) => {
    const { id, name, score, team } = req.body;

    if (!id) {
        return res.status(400).send('Missing id in request body');
    }
    if (!name) {
        return res.status(400).send('Missing name in request body');
    }
    if (score === undefined) {
        return res.status(400).send('Missing score in request body');
    }
    if (!team) {
        return res.status(400).send('Missing team in request body');
    }

    db.run(`
            INSERT INTO users (id, name, score, team) VALUES (?, ?, ?, ?)
        `,
        [id, name, score, team],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({ 
                message: `User ${name} with id ${id} was added to the database. \nScore: ${score} \nTeam: ${team}`
            });
        }
    );
})

//Set user score
app.post('/set-score', (req, res) => {
    const { id, newScore } = req.body;

    if (!id || newScore === undefined) {
        return res.status(400).json({ message: 'Both id and newScore are required' });
    }

    db.get(`SELECT name, score FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is found, update their score
        db.run(`UPDATE users SET score = ? WHERE id = ?`, [newScore, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Send response with updated score and user name
            res.json({
                message: `Score set to ${newScore} for user ${user.name}`
            });
        });
    });
});

// Add score to the current score for a user
app.post('/add-score', (req, res) => {
    const { id, increment } = req.body;

    if (!id || increment === undefined) {
        return res.status(400).json({ message: 'Both id and increment are required' });
    }

    // First, retrieve the user's name and current score
    db.get(`SELECT name, score FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is found, update their score
        db.run(`UPDATE users SET score = score + ? WHERE id = ?`, [increment, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Send response with updated score and user name
            res.json({
                message: `Score increased by ${increment} for user ${user.name}`
            });
        });
    });
});


// Subtract score from the current score for a user
app.post('/subtract-score', (req, res) => {
    const { id, decrement } = req.body;

    if (!id || decrement === undefined) {
        return res.status(400).json({ message: 'Both id and decrement are required' });
    }

    // First, retrieve the user's name and current score
    db.get(`SELECT name, score FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is found, update their score
        db.run(`UPDATE users SET score = score - ? WHERE id = ?`, [decrement, id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Send response with updated score and user name
            res.json({
                message: `Score decreased by ${decrement} for user ${user.name}`
            });
        });
    });
});


// Get the current score for a user
app.get('/get-user-score/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT score FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ score: row.score });
    });
});

// Get all users from a specific team with their individual and total team score
app.get('/get-team-score/:team', (req, res) => {
    const { team } = req.params;

    // Query to retrieve individual scores and calculate total score
    const query = `
        SELECT id, name, score
        FROM users
        WHERE team = ?
    `;

    // Query to calculate total team score
    const totalScoreQuery = `
        SELECT SUM(score) AS totalScore
        FROM users
        WHERE team = ?
    `;

    db.all(query, [team], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No users found for this team' });
        }

        // Get the total score for the team
        db.get(totalScoreQuery, [team], (err, total) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                users: rows,        // List of users with their individual scores
                totalScore: total.totalScore  // Total score for the team
            });
        });
    });
});

// Get all teams and their users with individual scores
app.get('/get-teams', (req, res) => {
    // Query to get all users grouped by team
    const query = `
        SELECT team, id, name, score
        FROM users
        ORDER BY team, id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No teams or users found' });
        }

        // Structure the result by grouping users under their teams
        const teams = {};

        rows.forEach(row => {
            if (!teams[row.team]) {
                teams[row.team] = {
                    totalScore: 0,
                    users: []
                };
            }

            teams[row.team].users.push({
                id: row.id,
                name: row.name,
                score: row.score
            });

            teams[row.team].totalScore += row.score;
        });

        const orderedTeams = Object.entries(teams).sort((a, b) => b[1].totalScore - a[1].totalScore).map(([key, value]) => {
            return {
                teamName: key,
                totalScore: value.totalScore,
                teamMembers: value.users
            }
        });

        res.json(orderedTeams);
    });
});


//Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});