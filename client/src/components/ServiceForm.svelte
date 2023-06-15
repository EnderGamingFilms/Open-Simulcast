<script>
    import { Stack, Switch, Button, Text, Modal, TextInput } from '@svelteuidev/core';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let loading = false;

    let opened = false;

    let serviceName = '';
    let rtmpUrl = '';
    let streamKey = '';
    let useTls = false;

    function closeModal() {
        opened = false;

        serviceName = '';
        rtmpUrl = '';
        streamKey = '';
        useTls = false;
    }

    async function submitForm() {
        if (!serviceName || !rtmpUrl) {
            // handle validation error
            console.log('All fields are required');
            return;
        }

        const service = {
            serviceName,
            rtmpUrl,
            streamKey,
            useTls,
        };

        // Post the service to the backend
        const response = await fetch('/api/v1/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(service),
        });

        if (response.ok) {
            closeModal();

            const newService = await response.json();

            dispatch('newService', newService);
        } else {
            dispatch('error', 'Service creation failed');
        }
    }
</script>

<Modal {opened} on:close={closeModal} title='Add RTMP Streaming Service'>
    <!-- Modal Content -->
    <Stack>
        <TextInput
            placeholder='Service Name'
            bind:value={serviceName}
            required />
        <TextInput placeholder='RTMP URL' bind:value={rtmpUrl} required />
        <TextInput placeholder='Stream Key' bind:value={streamKey} />
        <Stack>
            <Text>Use TLS</Text>
            <Switch bind:checked={useTls} />
        </Stack>
        <Stack>
            <Button on:click={submitForm}>Add Service</Button>
        </Stack>
    </Stack>
</Modal>

<Button on:click={() => (opened = true)} color={'#FFA000'} loading={loading}>Add Service</Button>
