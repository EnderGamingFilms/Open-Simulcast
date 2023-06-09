<script>
  import ServiceCard from './ServiceCard.svelte';
  import { onMount } from 'svelte';

  let services = [];

  onMount(async () => {
    const response = await fetch('/services');
    services = await response.json();
  });
</script>

<div class="grid">
  {#each services as service (service.id)}
    <ServiceCard {service} />
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
</style>
