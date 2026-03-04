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
import "@/styles/agent-form.css";

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

