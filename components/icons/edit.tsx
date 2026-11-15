import React from 'react'

export function Edit(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13" stroke="var(--gray-50)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.0399 3.02123L8.15988 10.9012C7.85988 11.2012 7.55988 11.7912 7.49988 12.2212L7.06988 15.2312C6.90988 16.3212 7.67988 17.0812 8.76988 16.9312L11.7799 16.5012C12.1999 16.4412 12.7899 16.1412 13.0999 15.8412L20.9799 7.96123C22.3399 6.60123 22.9799 5.02123 20.9799 3.02123C18.9799 1.02123 17.3999 1.66123 16.0399 3.02123Z" stroke="var(--gray-50)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.9099 4.14844C15.5799 6.53844 17.4499 8.40844 19.8499 9.08844" stroke="var(--gray-50)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
