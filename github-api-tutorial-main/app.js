// Fetch user repositories from GitHub API
function requestUserRepos(username) {
    return fetch(`https://api.github.com/users/${username}/repos`);
}

// Fetch commits for a specific repository
function requestRepoCommits(username, repo) {
    return fetch(`https://api.github.com/repos/${username}/${repo}/commits`);
}

// Display commits for the selected repository
function fetchRepoCommits(username, repo) {
    const ul = document.getElementById('userRepos');
    ul.innerHTML = `<li class="list-group-item text-info">Fetching commits for <strong>${repo}</strong>...</li>`;

    requestRepoCommits(username, repo)
        .then(response => response.json())
        .then(data => {
            ul.innerHTML = ''; // Clear previous results

            if (data.message === "Not Found") {
                ul.innerHTML = `<li class="list-group-item">Repository <strong>${repo}</strong> not found for user <strong>${username}</strong>.</li>`;
                return;
            }

            if (data.length === 0) {
                ul.innerHTML = `<li class="list-group-item">No commits found.</li>`;
                return;
            }

            // Render each commit
            data.forEach(commit => {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `
                    <p><strong>Message:</strong> ${commit.commit.message}</p>
                    <p><strong>Author:</strong> ${commit.commit.author.name}</p>
                    <p><strong>Date:</strong> ${new Date(commit.commit.committer.date).toLocaleString()}</p>
                `;
                ul.appendChild(li);
            });
        })
        .catch(() => {
            ul.innerHTML = `<li class="list-group-item">Error fetching commits.</li>`;
        });
}

// Display list of repositories for a user
function loadRepos(username) {
    const ul = document.getElementById('userRepos');
    ul.innerHTML = ''; // Clear list

    requestUserRepos(username)
        .then(response => response.json())
        .then(data => {
            if (data.message === "Not Found") {
                ul.innerHTML = `<li class="list-group-item">No user found with username: <strong>${username}</strong></li>`;
                return;
            }

            // Render each repository
            data.forEach(repo => {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `
                    <p><strong>Repository:</strong> 
                        <a href="?username=${username}&repos=${repo.name}" class="repo-link" data-username="${username}" data-repo="${repo.name}">
                            ${repo.name}
                        </a>
                    </p>
                    <p><strong>Description:</strong> ${repo.description || 'No description'}</p>
                    <p><strong>URL:</strong> <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
                `;
                ul.appendChild(li);
            });
        })
        .catch(() => {
            ul.innerHTML = `<li class="list-group-item">Error fetching repositories.</li>`;
        });
}

// When the page loads, check URL parameters and load data
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    const repo = params.get('repos');

    if (username) {
        document.getElementById('usernameInput').value = username;
        if (repo) {
            document.getElementById('reposInput').value = repo;
            fetchRepoCommits(username, repo);
        } else {
            loadRepos(username);
        }
    }
});

// Handle form submission
const gitHubForm = document.getElementById('gitHubForm');

gitHubForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('usernameInput').value.trim();
    const reposInput = document.getElementById('reposInput').value.trim();

    if (!usernameInput) {
        document.getElementById('userRepos').innerHTML = '<li class="list-group-item">Please enter a GitHub username.</li>';
        return;
    }

    // Update the URL to reflect the query
    if (reposInput === '') {
        window.location.search = `?username=${usernameInput}`;
    } else {
        window.location.search = `?username=${usernameInput}&repos=${reposInput}`;
    }
});
