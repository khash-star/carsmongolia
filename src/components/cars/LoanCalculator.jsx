import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator } from 'lucide-react';

export default function LoanCalculator({ carPrice }) {
  const [downPayment, setDownPayment] = useState(carPrice * 0.2);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTerm, setLoanTerm] = useState(36);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    const principal = carPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
                   (Math.pow(1 + monthlyRate, loanTerm) - 1);
    setMonthlyPayment(isNaN(payment) ? 0 : payment);
  }, [carPrice, downPayment, interestRate, loanTerm]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5" />
          Зээлийн тооцоолуур
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Урьдчилгаа: {new Intl.NumberFormat('mn-MN').format(downPayment)}₮</Label>
          <Slider
            value={[downPayment]}
            onValueChange={(v) => setDownPayment(v[0])}
            min={carPrice * 0.1}
            max={carPrice * 0.5}
            step={100000}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">{((downPayment / carPrice) * 100).toFixed(0)}% урьдчилгаа</p>
        </div>

        <div>
          <Label>Хүү: {interestRate}%</Label>
          <Slider
            value={[interestRate]}
            onValueChange={(v) => setInterestRate(v[0])}
            min={8}
            max={20}
            step={0.5}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Хугацаа: {loanTerm} сар</Label>
          <Slider
            value={[loanTerm]}
            onValueChange={(v) => setLoanTerm(v[0])}
            min={12}
            max={60}
            step={12}
            className="mt-2"
          />
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-1">Сарын төлбөр:</p>
          <p className="text-3xl font-bold text-blue-600">
            {new Intl.NumberFormat('mn-MN').format(monthlyPayment)}₮
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Нийт төлбөр: {new Intl.NumberFormat('mn-MN').format(monthlyPayment * loanTerm + downPayment)}₮
          </p>
        </div>
      </CardContent>
    </Card>
  );
}