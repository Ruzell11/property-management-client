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
            <button class="secondary-btn" @click="openEditModal">Edit</button>
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

    <!-- ── Edit Modal ── -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="showEditModal" class="dialog-overlay" @click.self="closeEditModal">
          <div class="dialog-box edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">

            <div class="modal-header">
              <div>
                <h2 id="edit-modal-title" class="dialog-title">Edit agent</h2>
                <p class="dialog-subtitle">Update the contact details below.</p>
              </div>
              <button class="close-btn" @click="closeEditModal" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>
              </button>
            </div>

            <Transition name="banner-slide">
              <div v-if="editBanner" class="banner" :class="editBannerType">
                <span class="banner-icon">{{ editBannerType === 'success' ? '✓' : '!' }}</span>
                {{ editBanner }}
              </div>
            </Transition>

            <form @submit.prevent="submitEdit" novalidate>
              <div class="field-row">
                <div class="field-group" :class="{ 'has-error': editErrors.firstName }">
                  <label class="field-label" for="edit-firstName">First name</label>
                  <input
                    id="edit-firstName"
                    class="field-input"
                    v-model="editForm.firstName"
                    type="text"
                    required
                    maxlength="100"
                    autocomplete="given-name"
                    ref="firstEditInputRef"
                  />
                  <p v-if="editErrors.firstName" class="field-error">{{ editErrors.firstName }}</p>
                </div>

                <div class="field-group" :class="{ 'has-error': editErrors.lastName }">
                  <label class="field-label" for="edit-lastName">Last name</label>
                  <input
                    id="edit-lastName"
                    class="field-input"
                    v-model="editForm.lastName"
                    type="text"
                    required
                    maxlength="100"
                    autocomplete="family-name"
                  />
                  <p v-if="editErrors.lastName" class="field-error">{{ editErrors.lastName }}</p>
                </div>
              </div>

              <div class="field-group" :class="{ 'has-error': editErrors.email }">
                <label class="field-label" for="edit-email">Email address</label>
                <input
                  id="edit-email"
                  class="field-input"
                  v-model="editForm.email"
                  type="email"
                  required
                  autocomplete="email"
                />
                <p v-if="editErrors.email" class="field-error">{{ editErrors.email }}</p>
              </div>

              <div class="field-group" :class="{ 'has-error': editErrors.mobileNumber }">
                <label class="field-label" for="edit-mobile">Mobile number</label>
                <input
                  id="edit-mobile"
                  class="field-input"
                  v-model="editForm.mobileNumber"
                  type="tel"
                  required
                  minlength="5"
                  maxlength="30"
                  autocomplete="tel"
                />
                <p v-if="editErrors.mobileNumber" class="field-error">{{ editErrors.mobileNumber }}</p>
              </div>

              <div class="modal-actions">
                <button type="button" class="secondary-btn" @click="closeEditModal" :disabled="editSaving">
                  Cancel
                </button>
                <button type="submit" class="primary-btn" :disabled="editSaving">
                  <span v-if="editSaving" class="btn-spinner" />
                  {{ editSaving ? 'Saving…' : 'Save changes' }}
                </button>
              </div>
            </form>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete dialog ── -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="showDeleteConfirm" class="dialog-overlay" @click.self="showDeleteConfirm = false">
          <div class="dialog-box delete-dialog">
            <h2 class="dialog-title">Delete agent?</h2>
            <p class="dialog-body">
              <strong>{{ agent?.firstName }} {{ agent?.lastName }}</strong> will be permanently
              removed. This cannot be undone.
            </p>
            <div class="modal-actions">
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
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAgent, updateAgent, deleteAgent } from '@/api/agents'
import type { PropertyAgent } from '@/types/agent'
import { API_ERROR_CODES } from '@/api/errorCodes'
import type { ValidationErrorDetail } from '@/api/errorCodes'

const route = useRoute()
const router = useRouter()
const agent = ref<PropertyAgent | null>(null)
const loading = ref(true)
const error = ref('')

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

// ── Edit modal ──────────────────────────────────────
const showEditModal = ref(false)
const editSaving = ref(false)
const editBanner = ref('')
const editBannerType = ref<'success' | 'error'>('error')
const editErrors = reactive<Record<string, string>>({})
const firstEditInputRef = ref<HTMLInputElement | null>(null)

const editForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: '',
})

async function openEditModal() {
  if (!agent.value) return
  editForm.firstName = agent.value.firstName
  editForm.lastName = agent.value.lastName
  editForm.email = agent.value.email
  editForm.mobileNumber = agent.value.mobileNumber
  editBanner.value = ''
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  showEditModal.value = true
  await nextTick()
  firstEditInputRef.value?.focus()
}

function closeEditModal() {
  showEditModal.value = false
}

async function submitEdit() {
  editBanner.value = ''
  Object.keys(editErrors).forEach(k => delete editErrors[k])
  editSaving.value = true

  const result = await updateAgent(id.value, { ...editForm })
  editSaving.value = false

  if (result.error) {
    const err = result.error.error
    if (err.code === API_ERROR_CODES.VALIDATION_ERROR && err.details?.length) {
      for (const d of (err.details as ValidationErrorDetail[])) {
        editErrors[d.path] = d.message
      }
    } else if (err.code === API_ERROR_CODES.CONFLICT) {
      editErrors.email = 'This email is already in use.'
    } else {
      editBanner.value = err.message
      editBannerType.value = 'error'
    }
    return
  }

  // Patch agent in place so the hero card updates instantly
  agent.value = result.data ?? agent.value
  editBanner.value = 'Changes saved.'
  editBannerType.value = 'success'
  setTimeout(() => { closeEditModal() }, 900)
}

// ── Delete ──────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deleting = ref(false)

async function doDelete() {
  if (!agent.value) return
  deleting.value = true
  const result = await deleteAgent(agent.value.id)
  deleting.value = false
  showDeleteConfirm.value = false
  if (result.error) {
    if (result.error.error.code === API_ERROR_CODES.NOT_FOUND) { router.replace('/'); return }
    error.value = result.error.error.message
    return
  }
  router.replace('/')
}
</script>

<style scoped>
.detail-page { display: flex; flex-direction: column; gap: 1.25rem; }

/* Breadcrumb */
.breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8125rem; }
.breadcrumb-link { color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
.breadcrumb-link:hover { color: var(--accent); }
.breadcrumb-sep { color: var(--text-faint); font-size: 0.75rem; }
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

.hero-identity { display: flex; align-items: center; gap: 1rem; }

.hero-avatar {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--accent-light);
  border: 1.5px solid var(--border);
  color: var(--accent);
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.hero-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin: 0;
}

.hero-id {
  margin: 0.25rem 0 0;
  font-size: 0.72rem;
  color: var(--text-faint);
  font-family: monospace;
  letter-spacing: 0.02em;
}

.hero-actions { display: flex; align-items: center; gap: 0.625rem; flex-shrink: 0; }

.divider { height: 1px; background: var(--border-subtle); margin: 0 -1.75rem; }

/* Detail grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
  margin: 0;
}
.detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
.detail-item dt {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-faint);
}
.detail-item dd { margin: 0; font-size: 0.9375rem; color: var(--text); }
.email-link { color: var(--accent); text-decoration: none; transition: color 0.15s; }
.email-link:hover { color: var(--accent-hover); }

/* Skeleton */
.skeleton-card { display: flex; flex-direction: column; gap: 1.5rem; }
.sk-header { display: flex; align-items: center; gap: 1rem; }
.sk-header-lines { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.sk-fields { display: flex; flex-direction: column; gap: 0.875rem; margin-top: 0.5rem; }
.sk-field-row { display: flex; flex-direction: column; gap: 0.3rem; }
.sk { background: var(--bg-alt); border-radius: 6px; animation: pulse 1.4s ease-in-out infinite; }
.sk-avatar-lg { width: 52px; height: 52px; border-radius: 12px; flex-shrink: 0; }
.sk-title { height: 22px; width: 55%; }
.sk-subtitle { height: 12px; width: 35%; opacity: 0.6; }
.sk-label { height: 10px; width: 25%; }
.sk-value { height: 14px; width: 55%; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Shared overlay */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(4px);
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
  padding: 1.75rem;
  width: 100%;
  box-shadow: var(--shadow-lg);
}

.edit-dialog  { max-width: 500px; }
.delete-dialog { max-width: 420px; }

/* Modal header */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.375rem;
}

.dialog-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.2rem;
  letter-spacing: -0.02em;
}

.dialog-subtitle {
  font-size: 0.8375rem;
  color: var(--text-muted);
  margin: 0;
}

.dialog-body {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0.375rem 0 0;
}
.dialog-body strong { color: var(--text); font-weight: 600; }

.close-btn {
  flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  margin-top: 2px;
}
.close-btn:hover { background: var(--bg-alt); color: var(--text); border-color: var(--text-faint); }

/* Fields */
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }

.field-group {
  display: flex; flex-direction: column; gap: 0.3rem;
  margin-bottom: 1rem;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}

.field-input {
  padding: 0.5rem 0.75rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.field-input::placeholder { color: var(--text-faint); }
.field-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
.has-error .field-input { border-color: var(--danger); box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }
.field-error { font-size: 0.775rem; color: var(--danger); font-weight: 500; margin: 0; }

/* Banner */
.banner {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.65rem 0.875rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem; font-weight: 500;
  margin-bottom: 1.125rem;
  border: 1px solid transparent;
}
.banner-icon {
  width: 17px; height: 17px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 800; flex-shrink: 0;
}
.banner.error { background: var(--danger-light); color: var(--danger); border-color: rgba(220,38,38,0.2); }
.banner.error .banner-icon { background: var(--danger); color: #fff; }
.banner.success { background: var(--success-light); color: var(--success); border-color: rgba(22,163,74,0.2); }
.banner.success .banner-icon { background: var(--success); color: #fff; }

/* Modal footer */
.modal-actions {
  display: flex; gap: 0.625rem; justify-content: flex-end;
  margin-top: 1.375rem; padding-top: 1.125rem;
  border-top: 1px solid var(--border-subtle);
}

/* Spinner */
.btn-spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: all 0.2s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
.dialog-fade-enter-from .dialog-box, .dialog-fade-leave-to .dialog-box {
  transform: translateY(10px) scale(0.98);
}

.banner-slide-enter-active, .banner-slide-leave-active { transition: all 0.2s ease; }
.banner-slide-enter-from, .banner-slide-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 480px) {
  .field-row { grid-template-columns: 1fr; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions > * { width: 100%; justify-content: center; }
}
</style>