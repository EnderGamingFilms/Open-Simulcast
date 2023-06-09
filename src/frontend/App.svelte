<script>
	import { writable } from "svelte/store";
	import ServiceGrid from "./ServiceGrid.svelte";
	import { SuiButton } from "@svelteuidev/core";

	import {
		colorScheme,
		SvelteUIProvider,
		Stack,
		Switch,
		Text,
	} from "@svelteuidev/core";

	function toggleTheme() {
		colorScheme.update((v) => (v === "light" ? "dark" : "light"));
	}
</script>

<SvelteUIProvider withGlobalStyles themeObserver={$colorScheme}>
	<Stack align="center">
		<Text>Press to change the theme</Text>
		<Switch on:change={toggleTheme} />
		<ServiceGrid />
	</Stack>
</SvelteUIProvider>
