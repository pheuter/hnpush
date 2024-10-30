<script>
	import { invalidateAll } from '$app/navigation';
	import { PUBLIC_VAPID_KEY } from '$env/static/public';

	let { data } = $props();

	async function handlePushNotifications() {
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
			alert(
				'Push notifications are not supported by your browser. On iOS, you must first add this site to your home screen using the share button and open it from there.'
			);
			return;
		}

		try {
			const registration = await navigator.serviceWorker.getRegistration();
			if (!registration) {
				alert('No service worker found. Please refresh the page and try again.');
				return;
			}

			if (data.hasSubscription) {
				// Disable notifications
				const subscription = await registration.pushManager.getSubscription();
				if (subscription) {
					await subscription.unsubscribe();
				}

				const response = await fetch('/', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' }
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(errorText || 'Failed to remove subscription from server');
				}
			} else {
				// Enable notifications
				const permission = await Notification.requestPermission();
				if (permission !== 'granted') {
					alert('Permission for notifications was denied');
					return;
				}

				const subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: PUBLIC_VAPID_KEY
				});

				const response = await fetch('/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(subscription.toJSON())
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(errorText || 'Failed to save subscription on server');
				}
			}

			invalidateAll();
		} catch (error) {
			console.error(
				`Error ${data.hasSubscription ? 'disabling' : 'enabling'} push notifications:`,
				error
			);
			alert(
				error instanceof Error
					? error.message
					: `Failed to ${data.hasSubscription ? 'disable' : 'enable'} push notifications`
			);
		}
	}
</script>

<div class="mx-auto max-w-xl px-4 py-16">
	<h1 class="text-4xl font-bold">HN Push</h1>
	<p class="text-lg text-stone-500 dark:text-stone-400">
		Web push notifications for top stories on
		<a
			class="inline-flex items-center"
			href="https://news.ycombinator.com"
			aria-label="Hacker News"
		>
			<svg
				class="size-5 translate-y-[3px]"
				viewBox="4 4 188 188"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="m4 4h188v188h-188z" fill="#f60" />
				<path
					d="m73.2521756 45.01 22.7478244 47.39130083 22.7478244-47.39130083h19.56569631l-34.32352071 64.48661468v41.49338532h-15.98v-41.49338532l-34.32352071-64.48661468z"
					fill="#fff"
				/>
			</svg>
		</a>
	</p>

	<!-- <div
		class="mt-8 rounded-md bg-white p-4 shadow dark:border dark:border-stone-800 dark:bg-stone-900"
	></div> -->

	<button
		class="mt-8 w-full rounded-md {data.hasSubscription
			? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:text-stone-100 dark:hover:bg-red-700'
			: 'bg-stone-800 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-800 dark:hover:bg-stone-200'} px-4 py-2 font-semibold text-stone-100 transition-colors"
		onclick={handlePushNotifications}
	>
		{data.hasSubscription ? 'Disable' : 'Enable'} Push Notifications
	</button>
</div>
