<script>
  import { Button, Switch, Badge, Code, ActionIcon, Header, Text } from '@svelteuidev/core';
  import { createEventDispatcher } from 'svelte';
  import { mdiCloseCircle } from '@mdi/js'
  import DeleteService from './DeleteService.svelte';
  import Icon from 'mdi-svelte';
  
  const dispatch = createEventDispatcher();
  
  export let service = {};
  export let statusAvailable = true;

  let showStreamKey = false;
  let showDeleteModal = false;

  function hasStreamKey() {
    return service.streamKey !== '';
  }

  function toggleStreamKey() {
    showStreamKey = !showStreamKey;
  }

  async function toggleService() {
    statusAvailable = false;

    const toggle = service.enabled ? 'disable' : 'enable';

    const response = await fetch(
      `http://localhost:5678/api/v1/services/${toggle}/${service.serviceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    service.enabled = data.enabled;

    statusAvailable = true;
  }
</script>

<DeleteService 
  opened={showDeleteModal} 
  serviceId={service.serviceId} 
  on:delete={() => dispatch('delete', service.serviceId)}
  on:cancel={() => showDeleteModal = false} />

<div class='service-card'>
  <span class='delete-btn'>
    <ActionIcon on:click={() => showDeleteModal = true}>
      <Icon path={mdiCloseCircle} color="#EF5350" />
    </ActionIcon>
  </span>

  <h2>{service.serviceName}</h2>

  <div class='card-content'>
    <div class='item-row'>
      <span>Key:</span>
      <span class='stream-key'>
        {#if showStreamKey}
          <Code>{service.streamKey}</Code>
        {:else}
          {#if hasStreamKey()}
          <span>***************************</span>
          {/if}
        {/if}
      </span>
      
      <Button on:click={toggleStreamKey} color={'indigo'} disabled={!hasStreamKey()} >
        {showStreamKey ? 'Hide' : 'Show'}
      </Button>
    </div>

    <div class='item-row'>
      <span>Endpoint:</span>
      <span class='endpoint'>{service.rtmpUrl}</span>
    </div>

    <div class='item-row'>
      <span>Port:</span>
      <span>{service.port}</span>
    </div>

    <div class='item-row'>
      <span>Use TLS:</span>
      <Switch bind:checked={service.useTls} disabled onLabel="ON" offLabel="OFF" size='lg' />
    </div>

    <div class='item-row'>
      <span>Container Status:</span>
      <Button on:click={toggleService} loading={!statusAvailable} color={service.enabled ? 'green' : 'red'}>
        {#if service.enabled}
          Enabled
        {:else}
          Disabled
        {/if}
      </Button>
    </div>

    <!-- TODO: Possibly move this to a Modal info button thing -->
    <!-- <div class='container-id'>
      <Badge color='indigo' size='sm' radius='sm'>
        CID: {service.containerId}
      </Badge>
    </div> -->
  </div>
</div>


<style>
  .service-card {
    background: inherit;
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2), 0 3px 10px 0 rgba(0,0,0,0.19);
    padding: 1em;
    margin: 1em;
    width: auto;
    min-width: 22rem;
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: center;
  }

  .delete-btn {
    position: absolute; 
    top: -15px;
    right: -15px;
    width: 30px; 
    height: 30px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .stream-key {
    margin-right: 1em;
    margin-left: 1em;
  }

  .endpoint {
    margin-left: 1em;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin: 0.5em 0;
  }

  .container-id {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 5%;
  }

  h2 {
    margin: 0.5rem 0;
    font-size: 1.5em;
    text-align: center;
  }
</style>
