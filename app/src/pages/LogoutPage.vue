<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user';

const router = useRouter();
const user = useUserStore();

onMounted(async () => {
  user.logout();
  await router.push({ name: 'login' });
});
</script>
