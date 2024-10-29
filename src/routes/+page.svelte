<script>
	import { PUBLIC_VAPID_KEY } from '$env/static/public';

	async function enablePushNotifications() {
		// Check if the browser supports push notifications
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
			alert('Sorry, push notifications are not supported by your browser');
			return;
		}

		try {
			// Request notification permission
			const permission = await Notification.requestPermission();
			if (permission !== 'granted') {
				alert('Permission for notifications was denied');
				return;
			}

			// Check for existing service worker registration
			const registration = await navigator.serviceWorker.getRegistration();

			if (!registration) {
				throw new Error('No service worker registration found');
			}

			// Get push subscription
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: PUBLIC_VAPID_KEY
			});

			// Log subscription instead of sending to server
			console.log(JSON.stringify(subscription.toJSON(), null, 2));
			alert('Successfully subscribed to push notifications!');
		} catch (error) {
			console.error('Error enabling push notifications:', error);
			alert('Failed to enable push notifications');
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
	<button
		class="mt-8 w-full rounded-md bg-stone-800 px-4 py-2 font-semibold text-stone-100 transition-colors hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-800 dark:hover:bg-stone-200"
		onclick={enablePushNotifications}
	>
		Enable Push Notifications
	</button>
</div>
