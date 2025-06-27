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
