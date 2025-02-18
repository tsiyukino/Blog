// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', function() {
    // Get search form and add submit event listener
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.querySelector('.Header-search-input');
            if (searchInput) {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    // Redirect to search page with query parameter
                    window.location.href = `/blog/search/?q=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
    }
});

// Function to get URL parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to perform search
async function performSearch() {
    const searchTerm = getQueryParam('q');
    if (!searchTerm) return;

    try {
        console.log('Fetching search index...');
        // Fetch the search index
        const response = await fetch('/blog/index.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const searchData = await response.json();
        console.log('Search data loaded:', searchData.length, 'items');

        // Configure Fuse.js options
        const options = {
            keys: ['title', 'content', 'summary', 'tags'],
            threshold: 0.3,
            includeMatches: true,
            minMatchCharLength: 2
        };

        const fuse = new Fuse(searchData, options);
        const results = fuse.search(searchTerm);
        console.log('Search results:', results.length, 'items found');

        // Display results
        const searchResults = document.getElementById('search-result');
        if (searchResults) {
            searchResults.style.display = 'block';
            
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="px-3 py-4">
                        <h3>No results found for "${searchTerm}"</h3>
                        <p>Try different keywords or check your spelling.</p>
                    </div>
                `;
                return;
            }

            let resultsHTML = `
                <div class="px-3 py-4">
                    <h3>${results.length} results for "${searchTerm}"</h3>
                </div>
                <ul class="px-3">
            `;

            results.forEach(({ item }) => {
                resultsHTML += `
                    <li class="col-12 d-flex width-full py-4 border-bottom color-border-secondary public source">
                        <div class="col-12 d-inline-block">
                            <div class="d-inline-block mb-1">
                                <h3 class="wb-break-all">
                                    <a href="${item.relpermalink}">${item.title}</a>
                                </h3>
                            </div>
                            <div>
                                <div class="col-12 d-inline-block text-gray mb-2 pr-4">
                                    ${item.summary || (item.content ? item.content.substring(0, 200) + '...' : '')}
                                </div>
                            </div>
                            <div class="f6 text-gray mt-2">
                                ${item.tags ? item.tags.map(tag => `
                                    <a class="muted-link mr-3" href="/blog/tags/${tag}">
                                        <svg class="octicon octicon-tag" viewBox="0 0 16 16" version="1.1" width="16" height="16">
                                            <path fill-rule="evenodd" d="M2.5 7.775V2.75a.25.25 0 01.25-.25h5.025a.25.25 0 01.177.073l6.25 6.25a.25.25 0 010 .354l-5.025 5.025a.25.25 0 01-.354 0l-6.25-6.25a.25.25 0 01-.073-.177zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zM6 5a1 1 0 100 2 1 1 0 000-2z"></path>
                                        </svg>
                                        ${tag}
                                    </a>
                                `).join('') : ''}
                                ${item.date ? `<span class="ml-0">Published <relative-time datetime="${new Date(item.date * 1000).toISOString()}">${new Date(item.date * 1000).toLocaleDateString()}</relative-time></span>` : ''}
                            </div>
                        </div>
                    </li>
                `;
            });

            resultsHTML += '</ul>';
            searchResults.innerHTML = resultsHTML;
        }
    } catch (error) {
        console.error('Search error:', error);
        const searchResults = document.getElementById('search-result');
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="px-3 py-4">
                    <h3>Error performing search</h3>
                    <p>Please try again later. Error: ${error.message}</p>
                </div>
            `;
        }
    }
}

// Check if we're on the search page and perform search
if (window.location.pathname.includes('/search/')) {
    console.log('On search page, performing search...');
    performSearch();
}