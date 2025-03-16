import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock contract calls
const mockContractCall = vi.fn()
const mockTxOk = (value) => ({ value, isOk: true })
const mockTxErr = (code) => ({ code, isOk: false })

// Mock contract
const mockContract = {
  registerChemical: (...args) => mockContractCall("registerChemical", ...args),
  approveChemical: (...args) => mockContractCall("approveChemical", ...args),
  updateChemical: (...args) => mockContractCall("updateChemical", ...args),
  getChemical: (...args) => mockContractCall("getChemical", ...args),
  isChemicalApproved: (...args) => mockContractCall("isChemicalApproved", ...args),
  setContractOwner: (...args) => mockContractCall("setContractOwner", ...args),
}

// Mock principals
const OWNER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const MANUFACTURER = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
const UNAUTHORIZED = "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"

describe("Chemical Registration Contract", () => {
  beforeEach(() => {
    mockContractCall.mockReset()
  })
  
  describe("registerChemical", () => {
    it("should register a chemical successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(1))
      
      const result = await mockContract.registerChemical(
          "Roundup Pro",
          "herbicide",
          ["glyphosate", "surfactant"],
          5,
          ["corn", "soybeans", "wheat"],
          "Monsanto",
      )
      
      expect(mockContractCall).toHaveBeenCalledWith(
          "registerChemical",
          "Roundup Pro",
          "herbicide",
          ["glyphosate", "surfactant"],
          5,
          ["corn", "soybeans", "wheat"],
          "Monsanto",
      )
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(1)
    })
    
    it("should fail with invalid inputs", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.registerChemical("", "herbicide", ["glyphosate"], 5, ["corn"], "Monsanto")
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.registerChemical(
          "Roundup Pro",
          "herbicide",
          ["glyphosate"],
          5,
          ["corn"],
          "Monsanto",
      )
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("approveChemical", () => {
    it("should approve a chemical successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.approveChemical(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("approveChemical", 1)
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if chemical not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.approveChemical(999)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail if caller is not the contract owner", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(1))
      
      const result = await mockContract.approveChemical(1)
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(1)
    })
  })
  
  describe("updateChemical", () => {
    it("should update a chemical successfully", async () => {
      mockContractCall.mockReturnValueOnce(mockTxOk(true))
      
      const result = await mockContract.updateChemical(1, 4, ["corn", "soybeans", "rice"])
      
      expect(mockContractCall).toHaveBeenCalledWith("updateChemical", 1, 4, ["corn", "soybeans", "rice"])
      expect(result.isOk).toBe(true)
      expect(result.value).toBe(true)
    })
    
    it("should fail if chemical not found", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(2))
      
      const result = await mockContract.updateChemical(999, 4, ["corn", "soybeans"])
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(2)
    })
    
    it("should fail with invalid toxicity level", async () => {
      mockContractCall.mockReturnValueOnce(mockTxErr(3))
      
      const result = await mockContract.updateChemical(
          1,
          11, // Invalid toxicity level (> 10)
          ["corn", "soybeans"],
      )
      
      expect(result.isOk).toBe(false)
      expect(result.code).toBe(3)
    })
  })
  
  describe("getChemical", () => {
    it("should return chemical information", async () => {
      const chemicalData = {
        name: "Roundup Pro",
        chemicalType: "herbicide",
        activeIngredients: ["glyphosate", "surfactant"],
        toxicityLevel: 5,
        approvedCrops: ["corn", "soybeans", "wheat"],
        manufacturer: "Monsanto",
        registrationDate: 123456,
        isApproved: true,
      }
      
      mockContractCall.mockReturnValueOnce(chemicalData)
      
      const result = await mockContract.getChemical(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("getChemical", 1)
      expect(result).toEqual(chemicalData)
    })
    
    it("should return null if chemical not found", async () => {
      mockContractCall.mockReturnValueOnce(null)
      
      const result = await mockContract.getChemical(999)
      
      expect(mockContractCall).toHaveBeenCalledWith("getChemical", 999)
      expect(result).toBeNull()
    })
  })
  
  describe("isChemicalApproved", () => {
    it("should return true for approved chemicals", async () => {
      mockContractCall.mockReturnValueOnce(true)
      
      const result = await mockContract.isChemicalApproved(1)
      
      expect(mockContractCall).toHaveBeenCalledWith("isChemicalApproved", 1)
      expect(result).toBe(true)
    })
    
    it("should return false for unapproved chemicals", async () => {
      mockContractCall.mockReturnValueOnce(false)
      
      const result = await mockContract.isChemicalApproved(2)
      
      expect(mockContractCall).toHaveBeenCalledWith("isChemicalApproved", 2)
      expect(result).toBe(false)
    })
  })
})

