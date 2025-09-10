<script lang="ts">
    // Svelte 5 compatible: using $props
    export type Row = {
      label: string;
      value?: string;
      note?: string;
      align?: 'left' | 'right';
    };
  
    interface Props {
      rows?: Row[];
      underlineIndex?: number | null;
    }
  
    let { rows = [], underlineIndex = null }: Props = $props();
  </script>
  
  <table class="w-full text-[12px] text-gray-700 dark:text-gray-300">
    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      {#each rows as row, i}
        <tr class="kv-row">
          <td class="w-[58%] py-1.5">{row.label}</td>
          <td class={"w-[12%] py-1.5 " + (row.align === 'right' ? 'text-right' : 'text-left')}>
            {row.value}
          </td>
          <td class={"w-[30%] py-1.5 text-right font-semibold text-gray-900 dark:text-gray-100 " + (underlineIndex === i ? 'border-b-2 border-blue-500' : '')}>
            {row.note}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  
  <style>
    /* subtle density tweak to resemble spreadsheet feel */
    .kv-row td { padding-top: .25rem; padding-bottom: .25rem; }
  </style>
  