// Get the GitHub username input form
const gitHubForm = document.getElementById('gitHubForm');

// Listen for submissions on the GitHub username input form
gitHubForm.addEventListener('submit', (e) => {
    // Prevent default form submission behavior (reload)
    e.preventDefault();

    // Get trimmed values from input fields
    const usernameInput = document.getElementById('usernameInput').value.trim();
    const reposInput = document.getElementById('reposInput').value.trim();
    const ul = document.getElementById('userRepos');

    // Clear any previous results
    ul.innerHTML = '';

    // Check if username is empty
    if (usernameInput === '') {
        ul.innerHTML = '<li class="list-group-item">Please enter a GitHub username.</li>';
        return;
    }

    // If only username is provided, fetch repositories
    if (reposInput === '') {
        requestUserRepos(usernameInput)
            .then(response => response.json())
            .then(data => {
                if (data.message === "Not Found") {
                    ul.innerHTML = `<li class="list-group-item">No user found with username: <strong>${usernameInput}</strong></li>`;
                    return;
                }

                data.forEach(repo => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item');

                    // Render repository info and make name clickable
                    li.innerHTML = `
                        <p><strong>Repository:</strong> 
                            <a href="#" class="repo-link" data-username="${usernameInput}" data-repo="${repo.name}">
                                ${repo.name}
                            </a>
                        </p>
                        <p><strong>Description:</strong> ${repo.description || 'No description'}</p>
                        <p><strong>URL:</strong> <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
                    `;
                    ul.appendChild(li);
                });

                // Add click event to each repository name
                document.querySelectorAll('.repo-link').forEach(link => {
                    link.addEventListener('click', function (e) {
                        e.preventDefault();
                        const username = this.dataset.username;
                        const repo = this.dataset.repo;
                        fetchRepoCommits(username, repo);
                    });
                });
            })
            .catch(() => {
                ul.innerHTML = `<li class="list-group-item">Error fetching repositories.</li>`;
            });

    } else {
        // If both username and repo are provided, fetch commits directly
        fetchRepoCommits(usernameInput, reposInput);
    }
});

// Function to fetch user repositories from GitHub API
function requestUserRepos(username) {
    return fetch(`https://elc1090.github.io/project2a-2025a-andressateixeira13/${username}/repos`);
}

// Function to fetch commits for a specific repository
function requestRepoCommits(username, repo) {
    return fetch(`https://elc1090.github.io/project2a-2025a-andressateixeira13/${repo}/commits`);
}

// Function to render commits for a specific repository
function fetchRepoCommits(username, repo) {
    const ul = document.getElementById('userRepos');
    ul.innerHTML = `<li class="list-group-item text-info">Fetching commits for <strong>${repo}</strong>...</li>`;

    requestRepoCommits(username, repo)
        .then(response => response.json())
        .then(data => {
            ul.innerHTML = ''; // Clear old results

            if (data.message === "Not Found") {
                ul.innerHTML = `<li class="list-group-item">Repository <strong>${repo}</strong> not found for user <strong>${username}</strong>.</li>`;
                return;
            }

            if (data.length === 0) {
                ul.innerHTML = `<li class="list-group-item">No commits found.</li>`;
                return;
            }

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
