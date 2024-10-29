<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>HN Push</title>
	<meta name="description" content="Web push notifications for top stories on Hacker News" />
</svelte:head>

<div class="min-h-dvh bg-stone-50 text-stone-950 antialiased dark:bg-stone-950 dark:text-stone-50">
	{@render children()}
</div>
