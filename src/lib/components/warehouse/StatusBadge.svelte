<script lang="ts">
    let { status }: { status: string } = $props();

    const colorMap: Record<string, string> = {
        'Open': 'bg-warm-200 text-warm-700 dark:bg-warm-700 dark:text-warm-200',
        'Released': 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
        'Picking': 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
        'Picked': 'bg-moss-100 text-moss-700 dark:bg-moss-900 dark:text-moss-300',
        'Partial Stage': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        'Partial Ship': 'bg-plum-100 text-plum-700 dark:bg-plum-900 dark:text-plum-300',
        'Shipped': 'bg-moss-100 text-moss-700 dark:bg-moss-900 dark:text-moss-300',
        'Assigned': 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
        'Staged': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        'Loaded': 'bg-plum-100 text-plum-700 dark:bg-plum-900 dark:text-plum-300',
        'Short': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        'Pending': 'bg-warm-200 text-warm-700 dark:bg-warm-700 dark:text-warm-200',
        'In Transit': 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
        'Complete': 'bg-moss-100 text-moss-700 dark:bg-moss-900 dark:text-moss-300',
    };

    const baseStatus = $derived(status.split(' (')[0]);
    const classes = $derived(colorMap[status] ?? colorMap[baseStatus] ?? 'bg-warm-200 text-warm-700');
</script>

<span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold {classes}">
    {status}
</span>
