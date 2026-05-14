export default function DisclaimerCard() {
    const disclaimers = [
        "Please be aware that Kaban.ng is a property advertising platform and is not involved in the actual transaction of listed properties. We do not provide warranties or guarantee the accuracy of property descriptions. Prospective buyers and tenants should contact listing agents for detailed information, and we encourage customers to review and rate the realtors on our platform. Kaban.ng is not responsible for the actions of agents, but we advise them to maintain positive customer relationships.",
    ]
    return (
        <div className="bg-[#F2DDDA] rounded-[10px] shadow">
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
