<script>
  import { onMount } from "svelte";
  import { SvelteUIProvider, Button, Grid, Group, Center, ActionIcon } from "@svelteuidev/core";
  import { mdiWeatherNight, mdiWhiteBalanceSunny } from "@mdi/js";
  import Icon from "mdi-svelte";
  import ServiceForm from "./ServiceForm.svelte";
  import ServiceCard from "./ServiceCard.svelte";

  let services = [];

  let doingAction = false;

  let darkMode = true;

  onMount(async () => {
    loadServices();
  });

  function handleNewService(event) {
    services = [...services, event.detail];
  }

  function handleDelete(event) {
    services = services.filter(service => service.serviceId !== event.detail);
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
  }

  async function loadServices() {
    doingAction = true;

    const response = await fetch("/api/v1/services");
    const data = await response.json();

    services = data.data; // Assumes "data" is the key for the array of services

    doingAction = false;
  }

  async function stopServices() {
    doingAction = true;

    for (const service of services) {
      const response = await fetch(`/api/v1/services/disable/${service.serviceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      console.log(`stopped service ${service.serviceId}`);

      service.enabled = data.enabled;
      
      services = services;
    }

    doingAction = false;
  }

  async function startServices() {
    doingAction = true;

    for (const service of services) {
      const response = await fetch(`/api/v1/services/enable/${service.serviceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      console.log(`started service ${service.serviceId}`);

      service.enabled = data.enabled;

      services = services;
    }

    doingAction = false;
  }
</script>

<SvelteUIProvider withGlobalStyles themeObserver={darkMode ? "dark" : "light"}>

  <div class="controls">
    <Center>
      <Group>
        <Button on:click={loadServices} color={"#1976D2"} loading={doingAction}>Reload</Button>
        <Button on:click={stopServices} color={"#EF5350"} loading={doingAction}>Stop All</Button>
        <Button on:click={startServices} color={"#00C853"} loading={doingAction}>Start All</Button>
        <ServiceForm on:newService={handleNewService}  loading={doingAction} />
        <ActionIcon size={36} on:click={toggleDarkMode} color={darkMode ? 'light' : 'dark'} variant={'outline'}>
          <Icon flip={'h'} path={darkMode ? mdiWeatherNight : mdiWhiteBalanceSunny} />
        </ActionIcon>
      </Group>
    </Center>
  </div>

  <div class="service-grid">
    <Grid>
      {#each services as service (service.serviceId)}
        <!-- <Grid.Col span={4}> -->
        <ServiceCard {service} on:delete={(event) => handleDelete(event)} />
        <!-- </Grid.Col> -->
      {/each}
    </Grid>
  </div>
</SvelteUIProvider>

<style>
  .service-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(auto, 1fr));
    grid-gap: 1rem;
  }

  .controls {
    margin-bottom: 2rem;
  }
</style>
