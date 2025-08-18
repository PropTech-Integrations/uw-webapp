<script lang="ts">
    import { marked } from 'marked';
    export let text = '';
    $effect(() => marked.setOptions({ breaks: true, gfm: true }));
  </script>
  
  <div class="prose prose-sm dark:prose-invert max-w-none" on:click>
    {@html marked.parse(text)}
  </div>
  