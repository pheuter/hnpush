const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

/**
 * Fetches a story by its ID from the Hacker News API
 * @param {number} id - The story ID
 * @returns {Promise<any>} The story details
 */
async function fetchStory(id) {
	const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
	return response.json();
}

/**
 * Fetches the top stories from Hacker News
 * @param {boolean} fetchDetails - Whether to fetch individual story details (default: false)
 * @returns {Promise<Array<number | any>>} Array of story IDs or story objects
 */
async function fetchTopStories(fetchDetails = false) {
	// First get the list of top story IDs
	const response = await fetch(`${HN_API_BASE}/topstories.json`);
	const ids = await response.json();

	// Take only the first 30 IDs
	const limitedIds = ids.slice(0, 30);

	// Return just the IDs if details aren't requested
	if (!fetchDetails) {
		return limitedIds;
	}

	// Fetch all stories in parallel if details are requested
	const stories = await Promise.all(limitedIds.map((/** @type {number} */ id) => fetchStory(id)));
	return stories;
}

export { fetchStory, fetchTopStories };
