import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  private categoryId: string;

  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!(type.includes('income') || type.includes('outcome'))) {
      throw new AppError(`Value of type isn't valided`);
    }
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    if (type.includes('outcome')) {
      const { total } = await transactionsRepository.getBalance();
      const valorTotal = total - value;
      if (valorTotal < 0) {
        throw new AppError(`You can't have a negative balance`);
      }
    }

    const categoryRepository = getRepository(Category);
    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    const transactions = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });
    await transactionsRepository.save(transactions);
    return transactions;
  }
}

export default CreateTransactionService;
