<script>
  import { mdiCheckboxMarkedCircleOutline, mdiCheckboxBlankCircleOutline } from '@mdi/js';
  import Icon from '@jamescoyle/svelte-icon';

  export let service;

  async function toggleService() {
    const response = await fetch(`/services/${service.id}`, {
      method: service.enabled ? 'PUT' : 'DELETE',
    });
    service = await response.json();
  }
</script>

<div class="card">
  <h2>{service.serviceName}</h2>
  <button on:click={toggleService}>
    {#if service.enabled}
      <Icon path={mdiCheckboxMarkedCircleOutline} color="green" />
    {:else}
      <Icon path={mdiCheckboxBlankCircleOutline} color="red" />
    {/if}
  </button>
</div>

<style>
  .card {
    border: 1px solid #ddd;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
