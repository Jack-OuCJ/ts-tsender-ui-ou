"use client"
import InputField from "./ui/inputField"
import { useState, useMemo, useEffect } from "react"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract, useReadContracts} from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils";
 
export default function AirdropForm() {
    // when the tokenAddress changes, update it
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()
    const total : number = useMemo(() => calculateTotal(amounts), [amounts])
    const { data: hash, isPending, writeContractAsync } = useWriteContract()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenName, setTokenName] = useState("")
    const [tokenDecimals, setTokenDecimals] = useState(0)

    const { data } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "name",
            },
        ],
    });

    useEffect(() => {
        if (data) {
            setTokenDecimals(Number(data[0].result)); // decimals
            setTokenName(data[1].result as string); // name
        }
    }, [data]);

    const totalTokenAmount = useMemo(() => {
        return tokenDecimals ? total / Math.pow(10, tokenDecimals) : 0;
    }, [total, tokenDecimals]);

    async function getApproveAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No address found, please use a supported chain")
            return 0
        }

        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`],
        })

        return response as number
    }

    async function handleSubmit() {
        // step1: Approve our tsender contract to send our tokens
        // 1a  if already moved to step2 
        // 2. Call the airdrop function on the tsender contract
        // 3. Wait for the transaction to be mined
        
        setIsLoading(true);
        try {
            const tSenderAddress = chainsToTSender[chainId]["tsender"];
            const approvedAmount = await getApproveAmount(tSenderAddress);

            if (approvedAmount < total) {
                const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, BigInt(total)],
                });
                await waitForTransactionReceipt(config, {
                hash: approvalHash
                });
                console.log("Approval successful");

                await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ]
                });
                console.log("Airdrop 01 success!");
            } else {
                await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ]
                });
                console.log("Airdrop 02 success!");
            }
        } catch (error) {
            console.error("Transaction failed", error);
            setError("Error, see console");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const handleClick = () => {
        if (error) setError(null);
        };

        document.addEventListener('click', handleClick);
        return () => {
        document.removeEventListener('click', handleClick);
        };
    }, [error]);

    useEffect(() => {
        const savedTokenAddress = localStorage.getItem('tokenAddress');
        const savedRecipients = localStorage.getItem('recipients');
        const savedAmounts = localStorage.getItem('amounts');

        if (savedTokenAddress) {
            setTokenAddress(savedTokenAddress);
        }
        if (savedRecipients) {
            setRecipients(savedRecipients);
        }
        if (savedAmounts) {
            setAmounts(savedAmounts);
        }
    }, )

    const handleTokenAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTokenAddress(e.target.value);
        localStorage.setItem('tokenAddress', e.target.value);
    };

    const handleRecipientsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRecipients(e.target.value);
        localStorage.setItem('recipients', e.target.value);
    };

    const handleAmountsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAmounts(e.target.value);
        localStorage.setItem('amounts', e.target.value);
    };

    return (
        <div>
            <InputField
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={handleTokenAddressChange}
            />
            <InputField
                label="Recipients"
                placeholder="0x123..., 0x456..."
                value={recipients}
                large
                onChange={handleRecipientsChange}
            />
            <InputField
                label="Amounts"
                placeholder="100, 200, 300, ..."
                value={amounts}
                large
                onChange={handleAmountsChange}
            />
            <div className="flex justify-center mt-4">
                <div className="border border-gray-300 rounded-md p-4 bg-white w-[70%]">
                    <h3 className="text-lg font-semibold mb-3 border-b-2 border-gray-300 pb-2">Transaction Details</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700">Token Name:</span>
                        <span className="font-medium">{tokenName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700">Amount (wei):</span>
                        <span className="font-medium">{total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Amount (tokens):</span>
                        <span className="font-medium">{totalTokenAmount}</span>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-4">
                <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-500 transition duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12A8 8 0 0 1 12 4v8H4z"></path>
                            </svg>
                            Confirming in wallet
                        </span>
                    ) : (
                        error ? error : 'Send Tokens'
                    )}
                </button>
            </div>
        </div>
    )
}