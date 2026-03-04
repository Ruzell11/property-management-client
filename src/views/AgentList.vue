<template>
  <div class="agents-page">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Agents</h1>
        <p class="page-sub">Manage property agents and their contact details.</p>
      </div>
      <button class="primary-btn" @click="openAddModal">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
        New Agent
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="card">
      <div class="skeleton-list">
        <div v-for="i in 4" :key="i" class="skeleton-row" :style="{ animationDelay: `${i * 80}ms` }">
          <div class="sk sk-avatar" />
          <div class="sk-body">
            <div class="sk sk-name" />
            <div class="sk sk-meta" />
          </div>
          <div class="sk sk-pill" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card empty-state">
      <span class="empty-state-icon">⚠️</span>
      <p>{{ error }}</p>
      <button class="secondary-btn" @click="load">Try again</button>
    </div>

    <!-- Empty -->
    <div v-else-if="agents.length === 0" class="card empty-state">
      <span class="empty-state-icon">🏘️</span>
      <p>No agents yet.</p>
      <button class="primary-btn" @click="openAddModal">Add the first one</button>
    </div>

    <!-- Table -->
    <div v-else class="card" style="padding: 0; overflow: hidden;">
      <div class="table-wrap" style="border: none; border-radius: 0;">
        <table class="table">
          <thead>
            <tr>
              <th>Agent</th>
              <th class="hide-sm">Email</th>
              <th class="hide-sm">Mobile</th>
              <th>Created</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in agents" :key="a.id" :class="{ 'row-new': a.id === newestId }">
              <td>
                <router-link :to="`/agents/${a.id}`" class="agent-name-cell">
                  <span class="agent-avatar">{{ initials(a) }}</span>
                  <span class="agent-fullname">{{ a.firstName }} {{ a.lastName }}</span>
                </router-link>
              </td>
              <td class="hide-sm muted-cell">{{ a.email }}</td>
              <td class="hide-sm muted-cell">{{ a.mobileNumber }}</td>
              <td class="muted-cell">{{ formatDate(a.createdAt) }}</td>
              <td style="text-align:right">
                <div class="row-actions">
                  <router-link :to="`/agents/${a.id}/edit`" class="link-btn">View</router-link>
                  <span class="sep">·</span>
                  <button class="link-btn danger" @click="promptDelete(a)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Add Agent Modal ── -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="showAddModal" class="dialog-overlay" @click.self="closeAddModal">
          <div class="dialog-box add-dialog" role="dialog" aria-modal="true" aria-labelledby="add-modal-title">

            <!-- Modal header -->
            <div class="modal-header">
              <div>
                <h2 id="add-modal-title" class="dialog-title">New agent</h2>
                <p class="dialog-subtitle">Fill in the details below to add a property agent.</p>
              </div>
              <button class="close-btn" @click="closeAddModal" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>
              </button>
            </div>

            <!-- Success state -->
            <Transition name="banner-slide">
              <div v-if="addBanner" class="banner" :class="addBannerType">
                <span class="banner-icon">{{ addBannerType === 'success' ? '✓' : '!' }}</span>
                {{ addBanner }}
              </div>
            </Transition>

            <!-- Form -->
            <form @submit.prevent="submitAdd" novalidate>
              <div class="field-row">
                <div class="field-group" :class="{ 'has-error': addErrors.firstName }">
                  <label class="field-label" for="add-firstName">First name</label>
                  <input
                    id="add-firstName"
                    class="field-input"
                    v-model="addForm.firstName"
                    type="text"
                    required
                    maxlength="100"
                    placeholder="Jane"
                    autocomplete="given-name"
                    ref="firstInputRef"
                  />
                  <p v-if="addErrors.firstName" class="field-error">{{ addErrors.firstName }}</p>
                </div>

                <div class="field-group" :class="{ 'has-error': addErrors.lastName }">
                  <label class="field-label" for="add-lastName">Last name</label>
                  <input
                    id="add-lastName"
                    class="field-input"
                    v-model="addForm.lastName"
                    type="text"
                    required
                    maxlength="100"
                    placeholder="Doe"
                    autocomplete="family-name"
                  />
                  <p v-if="addErrors.lastName" class="field-error">{{ addErrors.lastName }}</p>
                </div>
              </div>

              <div class="field-group" :class="{ 'has-error': addErrors.email }">
                <label class="field-label" for="add-email">Email address</label>
                <input
                  id="add-email"
                  class="field-input"
                  v-model="addForm.email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  autocomplete="email"
                />
                <p v-if="addErrors.email" class="field-error">{{ addErrors.email }}</p>
              </div>

              <div class="field-group" :class="{ 'has-error': addErrors.mobileNumber }">
                <label class="field-label" for="add-mobile">Mobile number</label>
                <input
                  id="add-mobile"
                  class="field-input"
                  v-model="addForm.mobileNumber"
                  type="tel"
                  required
                  minlength="5"
                  maxlength="30"
                  placeholder="+1 (555) 000-0000"
                  autocomplete="tel"
                />
                <p v-if="addErrors.mobileNumber" class="field-error">{{ addErrors.mobileNumber }}</p>
              </div>

              <div class="modal-actions">
                <button type="button" class="secondary-btn" @click="closeAddModal" :disabled="addSaving">
                  Cancel
                </button>
                <button type="submit" class="primary-btn" :disabled="addSaving">
                  <span v-if="addSaving" class="btn-spinner" />
                  {{ addSaving ? 'Creating…' : 'Create agent' }}
                </button>
              </div>
            </form>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete confirm dialog ── -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="deleteTarget" class="dialog-overlay" @click.self="deleteTarget = null">
          <div class="dialog-box delete-dialog">
            <h2 class="dialog-title">Delete agent?</h2>
            <p class="dialog-body">
              <strong>{{ deleteTarget.firstName }} {{ deleteTarget.lastName }}</strong> will be
              permanently removed. This cannot be undone.
            </p>
            <div class="modal-actions">
              <button class="secondary-btn" @click="deleteTarget = null" :disabled="deleting">Cancel</button>
              <button class="danger-btn" @click="confirmDelete" :disabled="deleting">
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { listAgents, createAgent, deleteAgent } from '@/api/agents'
import type { PropertyAgent } from '@/types/agent'
import { API_ERROR_CODES } from '@/api/errorCodes'
import type { ValidationErrorDetail } from '@/api/errorCodes'
import "@/styles/agent-list.css";

// ── List state ──────────────────────────────────────
const agents = ref<PropertyAgent[]>([])
const loading = ref(true)
const error = ref('')
const newestId = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  const result = await listAgents()
  loading.value = false
  if (result.error) {
    error.value = result.error.error.code === API_ERROR_CODES.INTERNAL_ERROR
      ? 'Something went wrong. Please try again.'
      : result.error.error.message
    return
  }
  agents.value = result.data ?? []
}

onMounted(load)

function initials(a: PropertyAgent) {
  return `${a.firstName[0] ?? ''}${a.lastName[0] ?? ''}`.toUpperCase()
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(iso))
}

// ── Add modal ───────────────────────────────────────
const showAddModal = ref(false)
const addSaving = ref(false)
const addBanner = ref('')
const addBannerType = ref<'success' | 'error'>('error')
const addErrors = reactive<Record<string, string>>({})
const firstInputRef = ref<HTMLInputElement | null>(null)

const addForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: '',
})

function resetAddForm() {
  addForm.firstName = ''
  addForm.lastName = ''
  addForm.email = ''
  addForm.mobileNumber = ''
  addBanner.value = ''
  Object.keys(addErrors).forEach(k => delete addErrors[k])
}

async function openAddModal() {
  resetAddForm()
  showAddModal.value = true
  await nextTick()
  firstInputRef.value?.focus()
}

function closeAddModal() {
  showAddModal.value = false
}

async function submitAdd() {
  addBanner.value = ''
  Object.keys(addErrors).forEach(k => delete addErrors[k])
  addSaving.value = true

  const result = await createAgent({ ...addForm })
  addSaving.value = false

  if (result.error) {
    const err = result.error.error
    if (err.code === API_ERROR_CODES.VALIDATION_ERROR && err.details?.length) {
      for (const d of (err.details as ValidationErrorDetail[])) {
        addErrors[d.path] = d.message
      }
    } else if (err.code === API_ERROR_CODES.CONFLICT) {
      addErrors.email = 'This email is already in use.'
    } else {
      addBanner.value = err.message
      addBannerType.value = 'error'
    }
    return
  }

  const created = result.data!
  agents.value.unshift(created)
  newestId.value = created.id
  setTimeout(() => { newestId.value = null }, 2000)

  closeAddModal()
}

// ── Delete ──────────────────────────────────────────
const deleteTarget = ref<PropertyAgent | null>(null)
const deleting = ref(false)

function promptDelete(a: PropertyAgent) {
  deleteTarget.value = a
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteAgent(deleteTarget.value.id)
    agents.value = agents.value.filter(a => a.id !== deleteTarget.value!.id)
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}
</script>

