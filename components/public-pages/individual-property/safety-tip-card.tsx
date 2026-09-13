export default function SafetyTipCard() {
    const safetyTips = [
        "Do not make any upfront payment, such as inspection fees, before physically seeing the property or meeting the agent you contacted.",
        "Conduct thorough research to determine the correct recipient of rent and other fees associated with the property.",
        "All meetings with agents should be done in open & public locations.",
        "This listing realtor is NOT a representative from Kaban.ng neither does Kaban.ng control the affairs of this realtor as both parties are different entities.",
    ]
    return (
        <div className="bg-[#F2DDDA] rounded-[10px] shadow">
            <div className="p-4 flex items-center justify-between text-foreground flex-wrap font-semibold border-b border-neutral-800">
                <h5>Kaban.ng Safety Tips</h5>
            </div>
            <div className="p-4">
                <li className="list-none space-y-2">
                    {safetyTips.map((tip, index) => (
                        <ol key={index} className="mb-3 text-sm">{`${index + 1}. `}{tip}</ol>
                    ))}
                </li>
            </div>
        </div>
    )
}
