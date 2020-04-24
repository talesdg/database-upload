import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const valueIncome = await (
      await this.find({
        where: { type: 'income' },
      })
    ).reduce((sum: number, current) => sum + current.value, 0);

    const valueOutcome = await (
      await this.find({
        where: { type: 'outcome' },
      })
    ).reduce((sum: number, current) => sum + current.value, 0);

    const total = valueIncome - valueOutcome;

    const balance: Balance = {
      income: valueIncome,
      outcome: valueOutcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
