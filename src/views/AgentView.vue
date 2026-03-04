<template>
  <div class="detail-page">

    <!-- Loading -->
    <div v-if="loading" class="card skeleton-card">
      <div class="sk-header">
        <div class="sk sk-avatar-lg" />
        <div class="sk-header-lines">
          <div class="sk sk-title" />
          <div class="sk sk-subtitle" />
        </div>
      </div>
      <div class="sk-fields">
        <div v-for="i in 4" :key="i" class="sk-field-row">
          <div class="sk sk-label" />
          <div class="sk sk-value" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card empty-state">
      <span class="empty-state-icon">⚠️</span>
      <p>{{ error }}</p>
      <router-link to="/" class="secondary-btn">← Back to agents</router-link>
    </div>

    <!-- Content -->
    <template v-else-if="agent">

      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Agents</router-link>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">{{ agent.firstName }} {{ agent.lastName }}</span>
      </nav>

      <!-- Hero card -->
      <div class="card hero-card">
        <div class="hero-top">
          <div class="hero-identity">
            <div class="hero-avatar">{{ initials }}</div>
            <div>
              <h1 class="hero-name">{{ agent.firstName }} {{ agent.lastName }}</h1>
              <p class="hero-id">ID: {{ agent.id }}</p>
            </div>
          </div>
          <div class="hero-actions">
            <router-link :to="`/agents/${agent.id}/edit`" class="secondary-btn">Edit</router-link>
            <button class="danger-btn" @click="showDeleteConfirm = true">Delete</button>
          </div>
        </div>

        <div class="divider" />

        <dl class="detail-grid">
          <div class="detail-item">
            <dt>Email</dt>
            <dd><a :href="`mailto:${agent.email}`" class="email-link">{{ agent.email }}</a></dd>
          </div>
          <div class="detail-item">
            <dt>Mobile</dt>
            <dd>{{ agent.mobileNumber }}</dd>
          </div>
          <div class="detail-item">
            <dt>Created</dt>
            <dd>{{ formatDate(agent.createdAt) }}</dd>
          </div>
          <div class="detail-item">
            <dt>Last updated</dt>
            <dd>{{ formatDate(agent.updatedAt) }}</dd>
          </div>
        </dl>
      </div>

    </template>

    <!-- Delete dialog -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="showDeleteConfirm" class="dialog-overlay" @click.self="showDeleteConfirm = false">
          <div class="dialog-box">
            <h2 class="dialog-title">Delete agent?</h2>
            <p class="dialog-body">
              <strong>{{ agent?.firstName }} {{ agent?.lastName }}</strong> will be permanently
              removed. This cannot be undone.
            </p>
            <div class="dialog-actions">
              <button class="secondary-btn" @click="showDeleteConfirm = false" :disabled="deleting">
                Cancel
              </button>
              <button class="danger-btn" :disabled="deleting" @click="doDelete">
                <span v-if="deleting" class="btn-spinner" />
                {{ deleting ? 'Deleting…' : 'Delete agent' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAgent, deleteAgent } from '@/api/agents'
import type { PropertyAgent } from '@/types/agent'
import { API_ERROR_CODES } from '@/api/errorCodes'

const route = useRoute()
const router = useRouter()
const agent = ref<PropertyAgent | null>(null)
const loading = ref(true)
const error = ref('')
const showDeleteConfirm = ref(false)
const deleting = ref(false)

const id = computed(() => route.params.id as string)

const initials = computed(() => {
  if (!agent.value) return ''
  return `${agent.value.firstName[0] ?? ''}${agent.value.lastName[0] ?? ''}`.toUpperCase()
})

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso))
}

onMounted(async () => {
  const result = await getAgent(id.value)
  loading.value = false
  if (result.error) {
    if (result.error.error.code === API_ERROR_CODES.NOT_FOUND) {
      error.value = 'Agent not found.'
      setTimeout(() => router.replace('/'), 2000)
    } else {
      error.value = result.error.error.message
    }
    return
  }
  agent.value = result.data ?? null
})

async function doDelete() {
  if (!agent.value) return
  deleting.value = true
  const result = await deleteAgent(agent.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  if (result.error) {
    if (result.error.error.code === API_ERROR_CODES.NOT_FOUND) {
      router.replace('/')
      return
    }
    error.value = result.error.error.message
    return
  }
  router.replace('/')
}
</script>

<style scoped>
.detail-page { display: flex; flex-direction: column; gap: 1.25rem; }

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}
.breadcrumb-link {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s;
}
.breadcrumb-link:hover { color: var(--accent); }
.breadcrumb-sep { color: var(--text-faint); }
.breadcrumb-current { color: var(--text); font-weight: 500; }

/* Hero card */
.hero-card { display: flex; flex-direction: column; gap: 1.5rem; }

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hero-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--accent-light);
  border: 1.5px solid var(--border);
  color: var(--accent);
  font-size: 1.125rem;
  font-weight: 700;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.hero-name {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--text);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
}

.hero-id {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: var(--text-faint);
  font-family: monospace;
  letter-spacing: 0.02em;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
}

.divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 0 -1.75rem;
}

/* Detail grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
  margin: 0;
}

.detail-item { display: flex; flex-direction: column; gap: 0.25rem; }

.detail-item dt {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-faint);
}

.detail-item dd {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text);
}

.email-link {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.15s;
}
.email-link:hover { color: var(--accent-hover); }

/* Skeleton */
.skeleton-card { display: flex; flex-direction: column; gap: 1.5rem; }

.sk-header { display: flex; align-items: center; gap: 1rem; }
.sk-header-lines { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.sk-fields { display: flex; flex-direction: column; gap: 0.875rem; margin-top: 0.5rem; }
.sk-field-row { display: flex; flex-direction: column; gap: 0.3rem; }

.sk {
  background: var(--bg-alt);
  border-radius: 6px;
  animation: pulse 1.4s ease-in-out infinite;
}
.sk-avatar-lg { width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0; }
.sk-title { height: 22px; width: 55%; }
.sk-subtitle { height: 12px; width: 35%; opacity: 0.6; }
.sk-label { height: 10px; width: 25%; }
.sk-value { height: 14px; width: 55%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%        { opacity: 0.4; }
}

/* Dialog (shared pattern) */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 23, 20, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.dialog-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}
.dialog-title {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 400;
  color: var(--text);
  margin: 0 0 0.75rem;
}
.dialog-body {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 1.5rem;
}
.dialog-body strong { color: var(--text); font-weight: 600; }
.dialog-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }

.btn-spinner {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.dialog-fade-enter-active, .dialog-fade-leave-active { transition: all 0.2s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
.dialog-fade-enter-from .dialog-box,
.dialog-fade-leave-to .dialog-box { transform: translateY(12px) scale(0.97); }
</style>