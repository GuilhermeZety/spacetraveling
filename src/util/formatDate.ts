import { format, parseISO } from "date-fns"
import ptBR from 'date-fns/locale/pt-BR';

export function formatDate(dateInString){


    var parsedDate = parseISO(dateInString)
    
    var teste = format(
      parsedDate,
      'dd MMM Y',
      {locale: ptBR}
    )
    return teste
}
