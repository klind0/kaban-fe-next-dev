export default function DisclaimerCard() {
    const disclaimers = [
        "Kaban.ng acts solely as a real estate marketing platform and is not a party to any property transactions. We make no representations or warranties regarding the accuracy of listed details. Interested buyers and tenants should contact the listing agent directly to verify all information. Although we encourage agents to maintain professional standards, Kaban.ng assumes no liability for agent conduct or transaction outcomes.",
    ]
    return (
        <div className="bg-[var(--color-red-100)] rounded-[10px] shadow">
            <div className="p-4 flex items-center justify-between text-foreground flex-wrap font-semibold border-b border-neutral-800">
                <h5>Kaban.ng Disclaimer</h5>
            </div>
            <div className="p-4">
                <li className="list-none space-y-2">
                    {disclaimers.map((item, index) => (
                        <ol key={index} className="mb-3 text-sm">{item}</ol>
                    ))}
                </li>
            </div>
        </div>
    )
}
