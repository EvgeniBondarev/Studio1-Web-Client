import type {DescriptionField} from '../components/DescriptionField.tsx';
import type { CtUserDetails} from '../../../api/types.ts';
import {useFormatDate} from '../../hooks/useFormatDate.ts';


export const useDescriptionFields = (user?: CtUserDetails | null) => {
  const { formatDate } = useFormatDate();

  if (!user) {
    return {
      contact: [],
      main: [],
      dates: [],
    }
  }

  return {
    contact: [
      { label: 'Email', value: user.Email, copyable: true },
      { label: 'Телефоны', value: user.Phones, copyable: true },
      { label: 'ICQ', value: user.Icq },
      { label: 'Адрес', value: user.Address },
    ] satisfies DescriptionField[],

    main: [
      { label: 'ID', value: user.Id },
      { label: 'Регион', value: user.Region },
      { label: 'Коэффициент', value: user.Coef },
      { label: 'Валюта', value: user.CurrencyId },
      { label: 'Тип пользователя', value: user.UserType },
      { label: 'Тип организации', value: user.OrganisationType },
      { label: 'Менеджер', value: user.Manager, span: 2 },
      { label: 'ИНН', value: user.Inn },
      { label: 'КПП', value: user.Kpp },
    ] satisfies DescriptionField[],

    dates: [
      {
        label: 'Дата регистрации',
        value: formatDate(user.Date),
      },
      {
        label: 'Дата рождения',
        value: formatDate(user.BirthDate),
      },
      {
        label: 'Последняя активность',
        value: formatDate(user.LastActivity),
      },
      {
        label: 'Последняя область',
        value: user.LastArea,
      },
    ] satisfies DescriptionField[],
  }
}
