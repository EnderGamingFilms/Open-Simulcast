<script>
  import { Button, Header, Modal, TextInput, Text, Code } from '@svelteuidev/core';
  import { createEventDispatcher } from 'svelte';

  export let serviceId;
  export let opened;

  let waiting = false;
  let enabled = true;
  
  const dispatch = createEventDispatcher();

  let confirmText = '';

  async function deleteService() {
    if (confirmText !== 'confirm') {
      alert('You must type "confirm" to delete this service');

      confirmText = '';

      return;
    }

    waiting = true;
    enabled = false;

    const response = await fetch(
      `http://localhost:5678/api/v1/services/${serviceId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    waiting = false;

    if (response.ok) {
      dispatch('delete', serviceId);
    } else {
      alert('Failed to delete service');
    }
  }

  async function close() {
    confirmText = '';
    dispatch('cancel');
  }
</script>

<Modal {opened} on:close={close} withCloseButton={true}>
  <Text color='red'>
    <h2>Remove Service</h2>
  </Text>

  <Header height={5} />

  <p>
    You are about to preform an irreversible action. This will delete the service <Code>{serviceId}</Code> and all of its data.
  </p>

  <div class='confirm-box'>
    <span class='input'>
      <TextInput bind:value={confirmText} disabled={!enabled} placeholder='Type "confirm" to proceed...' />
    </span>

    <span class='delete-btn'>
      <Button on:click={deleteService} disabled={!enabled} loading={waiting} color={'red'}>Confirm</Button>
    </span>
  </div>
</Modal>


<style>
  p {
    margin: 1rem 0;
    text-align: left;
  }

  h2 {
    text-align: center;
    margin-top: -2rem;
  }

  .input {
    width: 60%;
    padding-right: 1rem;
  }

  .confirm-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem 0;
  }

  .delete-btn {
    justify-content: center;
    align-items: center;
    display: flex;
    margin: 1rem 0;
  }
</style>