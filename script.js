// Chart instances
let sentimentChart, platformChart;

// Current filters
let currentFilters = {
    topic: '#Mahakumbh',
    platform: 'all',
    days: 30
};

// Initialize charts
function initCharts() {
    const sentimentCtx = document.getElementById('sentimentChart').getContext('2d');
    sentimentChart = new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
                }
            }
        });

    const platformCtx = document.getElementById('platformChart').getContext('2d');
    platformChart = new Chart(platformCtx, {
        type: 'bar',
        data: {
            labels: ['Twitter', 'Facebook', 'Instagram', 'LinkedIn'],
            datasets: [{
                label: 'Posts',
                data: [0, 0, 0, 0],
                backgroundColor: ['#1DA1F2', '#1877F2', '#E4405F', '#0A66C2']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Fetch data from Flask backend
async function fetchData(filters) {
    try {
        const response = await axios.get('/api/posts', {
            params: filters
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            posts: [],
            trending: [],
            stats: {
                sentiment: { positive: 0, negative: 0, neutral: 0 },
                platforms: { twitter: 0, facebook: 0, instagram: 0, linkedin: 0 }
            }
        };
    }
}

// Render posts to the DOM
function renderPosts(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<div class="no-posts">No posts found for the selected filters</div>';
        document.getElementById('post-count').textContent = '0 posts found';
        return;
    }

    document.getElementById('post-count').textContent = `${posts.length} posts found`;

    posts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post';

        // Determine platform icon and color
        let platformIcon, platformBg;
        switch(post.platform) {
            case 'twitter':
                platformIcon = 'fab fa-twitter';
                platformBg = 'twitter-bg';
                break;
            case 'facebook':
                platformIcon = 'fab fa-facebook-f';
                platformBg = 'facebook-bg';
                break;
            case 'instagram':
                platformIcon = 'fab fa-instagram';
                platformBg = 'instagram-bg';
                break;
            case 'linkedin':
                platformIcon = 'fab fa-linkedin-in';
                platformBg = 'linkedin-bg';
                break;
        }

        // Determine sentiment class
        let sentimentClass;
        switch(post.sentiment) {
            case 'positive':
                sentimentClass = 'sentiment-positive';
                break;
            case 'negative':
                sentimentClass = 'sentiment-negative';
                break;
            case 'neutral':
                sentimentClass = 'sentiment-neutral';
                break;
        }

        postEl.innerHTML = `
            <div class="post-header">
                <div class="post-platform ${platformBg}">
                    <i class="${platformIcon}"></i>
                </div>
                <div class="post-user">${post.user}</div>
                <div class="post-handle">${post.handle}</div>
                <div class="post-time">${post.time}</div>
            </div>
            <div class="post-content">
                ${post.content}
            </div>
            <div>
                <span class="post-sentiment ${sentimentClass}">${post.sentiment.toUpperCase()}</span>
                <span style="margin-left: 15px;"><i class="far fa-thumbs-up"></i> ${post.likes.toLocaleString()}</span>
                <span style="margin-left: 10px;"><i class="far fa-comment"></i> ${post.comments.toLocaleString()}</span>
            </div>
        `;

        container.appendChild(postEl);
    });
}

// Update charts with new data
function updateCharts(stats) {
    // Update sentiment chart
    sentimentChart.data.datasets[0].data = [
        stats.sentiment.positive,
        stats.sentiment.negative,
        stats.sentiment.neutral
    ];
    sentimentChart.update();

    // Update sentiment stats
    document.querySelector('.stat.positive .stat-value').textContent = `${stats.sentiment.positive}%`;
    document.querySelector('.stat.negative .stat-value').textContent = `${stats.sentiment.negative}%`;
    document.querySelector('.stat.neutral .stat-value').textContent = `${stats.sentiment.neutral}%`;

    // Update platform chart
    platformChart.data.datasets[0].data = [
        stats.platforms.twitter,
        stats.platforms.facebook,
        stats.platforms.instagram,
        stats.platforms.linkedin
    ];
    platformChart.update();
}

// Update trending topics
function updateTrendingTopics(topics) {
    const container = document.getElementById('trending-tags');
    container.innerHTML = '';

    topics.forEach(topic => {
        const tag = document.createElement('div');
        tag.className = `topic-tag ${topic.tag === currentFilters.topic ? 'active' : ''}`;
        tag.textContent = topic.tag;
        tag.addEventListener('click', () => {
            currentFilters.topic = topic.tag;
            updateDashboard();
        });
        container.appendChild(tag);
    });
}

// Show loading state
function setLoading(loading) {
    const container = document.getElementById('posts-container');
    if (loading) {
        container.classList.add('loading');
    } else {
        container.classList.remove('loading');
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update toggle button icon
    const toggleButton = document.getElementById('theme-toggle');
    toggleButton.innerHTML = newTheme === 'dark' 
        ? '<i class="fas fa-moon"></i> Toggle Theme'
        : '<i class="fas fa-sun"></i> Toggle Theme';
}

// Main function to update the dashboard
async function updateDashboard() {
    setLoading(true);
    
    // Update UI to reflect current filters
    document.querySelectorAll('.topic-tag').forEach(tag => {
        tag.classList.toggle('active', tag.textContent === currentFilters.topic);
    });
    
    document.querySelectorAll('.platform-filter[data-platform]').forEach(filter => {
        filter.classList.toggle('active', filter.dataset.platform === currentFilters.platform);
    });
    
    document.getElementById('time-range-select').value = currentFilters.days;
    document.getElementById('sentiment-time-info').textContent = 
        document.getElementById('platform-time-info').textContent = 
        `Last ${currentFilters.days} days`;
    
    // Fetch data from Flask backend
    const data = await fetchData(currentFilters);
    
    // Update UI with new data
    updateTrendingTopics(data.trending);
    renderPosts(data.posts);
    updateCharts(data.stats);
    
    setLoading(false);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize charts
    initCharts();
    
    // Set up platform filter clicks
    document.querySelectorAll('.platform-filter[data-platform]').forEach(filter => {
        filter.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            currentFilters.platform = this.dataset.platform;
            updateDashboard();
        });
    });
    
    // Set up time range selector
    document.getElementById('time-range-select').addEventListener('change', function() {
        currentFilters.days = parseInt(this.value);
        updateDashboard();
    });
    
    // Set up search button
    document.getElementById('search-button').addEventListener('click', function() {
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            currentFilters.topic = query;
            updateDashboard();
        }
    });
    
    // Set up reset button
    document.getElementById('reset-button').addEventListener('click', function() {
        document.getElementById('search-input').value = '';
        currentFilters = {
            topic: '#Mahakumbh',
            platform: 'all',
            days: 30
        };
        updateDashboard();
    });
    
    // Set up theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Allow Enter key to trigger search
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('search-button').click();
        }
    });
    
    // Load initial data
    await updateDashboard();
});