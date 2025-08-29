<script lang="ts">
  import { Card, Button, Badge } from 'flowbite-svelte';
  const resources = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using StratiqAI and how to get your first project up and running.',
      link: '/learning/getting-started',
      tag: 'Beginner'
    },
    {
      title: 'Project Management',
      description: 'Best practices and workflows for managing your real estate projects efficiently.',
      link: '/learning/project-management',
      tag: 'Intermediate'
    },
    {
      title: 'Investment Analysis',
      description: 'Deep dive into the analysis tools and how to interpret results for smarter decisions.',
      link: '/learning/investment-analysis',
      tag: 'Advanced'
    },
    {
      title: 'Document Review',
      description: 'How to upload, organize, and review documents within your projects.',
      link: '/learning/document-review',
      tag: 'Beginner'
    },
    {
      title: 'FAQs',
      description: 'Frequently asked questions and troubleshooting tips.',
      link: '/learning/faqs',
      tag: 'All'
    }
  ];
</script>

<section class="max-w-5xl mx-auto py-10 px-4">
  <h1 class="text-3xl font-bold mb-2">Learning Center</h1>
  <p class="mb-8 text-gray-600">Explore guides, tutorials, and resources to help you get the most out of StratiqAI.</p>
  <div class="grid gap-6 md:grid-cols-2">
    {#each resources as resource}
      <Card class="flex flex-col justify-between p-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="font-semibold text-lg">{resource.title}</span>
            <Badge color={resource.tag === 'Beginner' ? 'green' : resource.tag === 'Intermediate' ? 'yellow' : resource.tag === 'Advanced' ? 'red' : 'gray'}>
              {resource.tag}
            </Badge>
          </div>
          <p class="text-gray-500 mb-4">{resource.description}</p>
        </div>
        <Button href={resource.link} color="primary" class="w-fit">Read More</Button>
      </Card>
    {/each}
  </div>
</section>
