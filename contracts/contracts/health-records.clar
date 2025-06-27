;; Health Records Access Control Contract
;; Manages access permissions for health records stored on Gaia

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-record-not-found (err u102))
(define-constant err-already-exists (err u103))

;; Define data variables
(define-data-var record-counter uint u0)
(define-data-var emergency-access-enabled bool true)

;; Define data maps
(define-map health-records
  { record-id: uint }
  {
    owner: principal,
    title: (string-ascii 100),
    record-type: (string-ascii 50),
    gaia-url: (string-ascii 500),
    created-at: uint,
    is-active: bool
  }
)

(define-map record-permissions
  { record-id: uint, user: principal }
  { can-read: bool, can-write: bool, granted-at: uint }
)

(define-map user-records
  { owner: principal, record-id: uint }
  { exists: bool }
)

(define-map emergency-contacts
  { user: principal, contact: principal }
  { 
    contact-type: (string-ascii 20),
    relationship: (string-ascii 50),
    can-access-all: bool,
    added-at: uint,
    is-active: bool
  }
)

(define-map emergency-access-log
  { record-id: uint, emergency-contact: principal, access-time: uint }
  { 
    record-owner: principal,
    access-reason: (string-ascii 200),
    is-valid: bool
  }
)

;; Read-only functions
(define-read-only (get-record (record-id uint))
  (map-get? health-records { record-id: record-id })
)

(define-read-only (get-record-permission (record-id uint) (user principal))
  (map-get? record-permissions { record-id: record-id, user: user })
)

(define-read-only (can-access-record (record-id uint) (user principal))
  (let ((record (unwrap! (get-record record-id) false))
        (permission (get-record-permission record-id user)))
    (or 
      (is-eq (get owner record) user)
      (match permission
        perm (get can-read perm)
        false
      )
    )
  )
)

(define-read-only (get-record-count)
  (var-get record-counter)
)

(define-read-only (get-emergency-contact (user principal) (contact principal))
  (map-get? emergency-contacts { user: user, contact: contact })
)

(define-read-only (is-emergency-contact (user principal) (contact principal))
  (match (get-emergency-contact user contact)
    emergency-info (get is-active emergency-info)
    false
  )
)

(define-read-only (can-emergency-access (record-id uint) (emergency-contact principal))
  (let ((record (unwrap! (get-record record-id) false)))
    (and 
      (var-get emergency-access-enabled)
      (is-emergency-contact (get owner record) emergency-contact)
    )
  )
)

(define-read-only (get-emergency-access-log (record-id uint) (emergency-contact principal) (access-time uint))
  (map-get? emergency-access-log { record-id: record-id, emergency-contact: emergency-contact, access-time: access-time })
)

;; Public functions
(define-public (create-record (title (string-ascii 100)) (record-type (string-ascii 50)) (gaia-url (string-ascii 500)))
  (let ((record-id (+ (var-get record-counter) u1)))
    (map-set health-records
      { record-id: record-id }
      {
        owner: tx-sender,
        title: title,
        record-type: record-type,
        gaia-url: gaia-url,
        created-at: block-height,
        is-active: true
      }
    )
    (map-set user-records
      { owner: tx-sender, record-id: record-id }
      { exists: true }
    )
    (var-set record-counter record-id)
    (ok record-id)
  )
)

(define-public (grant-access (record-id uint) (user principal) (can-read bool) (can-write bool))
  (let ((record (unwrap! (get-record record-id) err-record-not-found)))
    (asserts! (is-eq (get owner record) tx-sender) err-not-authorized)
    (map-set record-permissions
      { record-id: record-id, user: user }
      { can-read: can-read, can-write: can-write, granted-at: block-height }
    )
    (ok true)
  )
)

(define-public (revoke-access (record-id uint) (user principal))
  (let ((record (unwrap! (get-record record-id) err-record-not-found)))
    (asserts! (is-eq (get owner record) tx-sender) err-not-authorized)
    (map-delete record-permissions { record-id: record-id, user: user })
    (ok true)
  )
)

(define-public (update-record-url (record-id uint) (new-gaia-url (string-ascii 500)))
  (let ((record (unwrap! (get-record record-id) err-record-not-found)))
    (asserts! (is-eq (get owner record) tx-sender) err-not-authorized)
    (map-set health-records
      { record-id: record-id }
      (merge record { gaia-url: new-gaia-url })
    )
    (ok true)
  )
)

(define-public (deactivate-record (record-id uint))
  (let ((record (unwrap! (get-record record-id) err-record-not-found)))
    (asserts! (is-eq (get owner record) tx-sender) err-not-authorized)
    (map-set health-records
      { record-id: record-id }
      (merge record { is-active: false })
    )
    (ok true)
  )
)

;; Emergency Access Functions
(define-public (add-emergency-contact (contact principal) (contact-type (string-ascii 20)) (relationship (string-ascii 50)) (can-access-all bool))
  (let ((existing-contact (get-emergency-contact tx-sender contact)))
    (asserts! (is-none existing-contact) err-already-exists)
    (map-set emergency-contacts
      { user: tx-sender, contact: contact }
      {
        contact-type: contact-type,
        relationship: relationship,
        can-access-all: can-access-all,
        added-at: block-height,
        is-active: true
      }
    )
    (ok true)
  )
)

(define-public (remove-emergency-contact (contact principal))
  (let ((existing-contact (unwrap! (get-emergency-contact tx-sender contact) err-record-not-found)))
    (map-set emergency-contacts
      { user: tx-sender, contact: contact }
      (merge existing-contact { is-active: false })
    )
    (ok true)
  )
)

(define-public (emergency-access-record (record-id uint) (access-reason (string-ascii 200)))
  (let ((record (unwrap! (get-record record-id) err-record-not-found)))
    (asserts! (can-emergency-access record-id tx-sender) err-not-authorized)
    (map-set emergency-access-log
      { record-id: record-id, emergency-contact: tx-sender, access-time: block-height }
      {
        record-owner: (get owner record),
        access-reason: access-reason,
        is-valid: true
      }
    )
    (ok (get gaia-url record))
  )
)

(define-public (toggle-emergency-access-system)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set emergency-access-enabled (not (var-get emergency-access-enabled)))
    (ok (var-get emergency-access-enabled))
  )
)
