;; Chemical Registration Contract
;; Records details of agricultural chemicals used

;; Define data variables
(define-data-var chemical-id-counter uint u0)

(define-map chemicals
  { id: uint }
  {
    name: (string-ascii 50),
    chemical-type: (string-ascii 20),  ;; "pesticide", "fertilizer", "herbicide", etc.
    active-ingredients: (list 5 (string-ascii 30)),
    toxicity-level: uint,  ;; 1-10 scale, 10 being most toxic
    approved-crops: (list 10 (string-ascii 30)),
    manufacturer: (string-ascii 50),
    registration-date: uint,
    is-approved: bool
  }
)

;; Error codes
(define-constant ERR_UNAUTHORIZED u1)
(define-constant ERR_NOT_FOUND u2)
(define-constant ERR_INVALID_INPUT u3)

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Register a new chemical
(define-public (register-chemical
              (name (string-ascii 50))
              (chemical-type (string-ascii 20))
              (active-ingredients (list 5 (string-ascii 30)))
              (toxicity-level uint)
              (approved-crops (list 10 (string-ascii 30)))
              (manufacturer (string-ascii 50)))
  (let
    (
      (chemical-id (+ (var-get chemical-id-counter) u1))
    )
    ;; Only contract owner can register chemicals
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Validate inputs
    (asserts! (> (len name) u0) (err ERR_INVALID_INPUT))
    (asserts! (> (len chemical-type) u0) (err ERR_INVALID_INPUT))
    (asserts! (> (len active-ingredients) u0) (err ERR_INVALID_INPUT))
    (asserts! (and (>= toxicity-level u1) (<= toxicity-level u10)) (err ERR_INVALID_INPUT))

    ;; Update counter
    (var-set chemical-id-counter chemical-id)

    ;; Store chemical information
    (map-set chemicals
      { id: chemical-id }
      {
        name: name,
        chemical-type: chemical-type,
        active-ingredients: active-ingredients,
        toxicity-level: toxicity-level,
        approved-crops: approved-crops,
        manufacturer: manufacturer,
        registration-date: block-height,
        is-approved: false
      }
    )

    (ok chemical-id)
  )
)

;; Approve a chemical
(define-public (approve-chemical (chemical-id uint))
  (let
    (
      (chemical-data (unwrap! (map-get? chemicals { id: chemical-id }) (err ERR_NOT_FOUND)))
    )
    ;; Only contract owner can approve chemicals
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Update approval status
    (map-set chemicals
      { id: chemical-id }
      (merge chemical-data { is-approved: true })
    )

    (ok true)
  )
)

;; Update chemical information
(define-public (update-chemical
              (chemical-id uint)
              (toxicity-level uint)
              (approved-crops (list 10 (string-ascii 30))))
  (let
    (
      (chemical-data (unwrap! (map-get? chemicals { id: chemical-id }) (err ERR_NOT_FOUND)))
    )
    ;; Only contract owner can update chemicals
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))

    ;; Validate inputs
    (asserts! (and (>= toxicity-level u1) (<= toxicity-level u10)) (err ERR_INVALID_INPUT))

    ;; Update chemical information
    (map-set chemicals
      { id: chemical-id }
      (merge chemical-data
        {
          toxicity-level: toxicity-level,
          approved-crops: approved-crops
        }
      )
    )

    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-chemical (chemical-id uint))
  (map-get? chemicals { id: chemical-id })
)

(define-read-only (is-chemical-approved (chemical-id uint))
  (default-to false (get is-approved (map-get? chemicals { id: chemical-id })))
)

;; Set contract owner
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR_UNAUTHORIZED))
    (ok (var-set contract-owner new-owner))
  )
)

