export const localize = (key)=> {
    switch (key) {
        case 'deliveryDate':
            return 'დასრულების თარიღი';
        case 'takeDate':
            return 'აღების თარიღი';
        case 'deliveryAddress':
            return 'მიტანის მისამართი';
        case 'takeAddress':
            return 'აღების მისამართი';
        case 'description':
            return 'დამატებითი ინფორმაცია';
        case 'phone':
            return 'ტელეფონის ნომერი';
        case 'name':
            return 'სახელი';
        case 'budget':
            return 'ბიუჯეტი';
        case 'address':
            return 'მისამართი';
        case 'status':
            return 'სტატუსი';
        case 'client':
            return 'კლიენტი';
        case 'takeCourier':
            return 'ამღები კურიერი';
        case 'deliveryCourier':
            return 'ჩამბარებელი კურიერი';
        case 'registerDate':
            return 'რეგისტრაციის თარიღი';
        case 'price':
            return 'შეკვეთის ფასი';
        case 'clientEmail':
            return 'კლიენტის ელფოსტა';
        case 'service':
            return 'სერვისი';
        case 'rates':
            return 'ფასები';
        case 'delivery':
            return 'მიტანის';
        case 'takeRate':
            return 'აღების';
        case 'normalRate':
            return 'სტანდ.';
        case 'expressRate':
            return 'ექსპრესი';
        case 'newBudget':
            return 'ახალი';
        case 'oldBudget':
            return 'ძველი';
        case 'change':
            return 'ცვლილება';
        case 'date':
            return 'თარიღი';
        case 'courier':
            return 'მეილი';
        default:
            return key;
    }
}
