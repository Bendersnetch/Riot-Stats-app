<script setup lang="ts">
    const router = useRoute()

    onMounted(() => {
        console.log(router.name)
    })

</script>

<template>
    <div class="navbar">
        <ul class="w-full">
            <li class="">
                <div class="p-3">
                    <NuxtLink to="/" class="nav-button block text-center mb-2" :class="router.name === 'index' ? 'active': ''"><Icon class="float-start h-6 w-6" name="line-md:speed-twotone-loop"/> <span>Dashboard</span></NuxtLink>
                    <NuxtLink to="players" class="nav-button block text-center mb-2" :class="router.name === 'players' ? 'active': ''"><Icon class="float-start h-6 w-6" name="line-md:person-twotone"/> <span>Players</span></NuxtLink>
                    <NuxtLink to="champions" class="nav-button block text-center mb-2" :class="router.name === 'champions' ? 'active': ''"><Icon class="float-start h-6 w-6" name="line-md:star-alt-twotone"/> <span>Champions</span></NuxtLink>
                </div>
            </li>
        </ul>
    </div>
</template>