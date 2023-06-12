<script>
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';

  import { AppShell, ShellSection, Center } from '@svelteuidev/core';
  import MainContent from './components/MainContent.svelte';
</script>

<AppShell>
  <ShellSection grow>
    <Center>
      <MainContent />
    </Center>
  </ShellSection>
</AppShell>
