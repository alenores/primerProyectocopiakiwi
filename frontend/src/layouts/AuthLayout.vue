<template lang="pug">
v-app
  v-main
    v-container(fluid fill-height)
      slot
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>
