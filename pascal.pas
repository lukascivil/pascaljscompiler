// Program Program3;
// const
//     FiveFoo      = 5;
//     StringFoo    = "string constant";
// Var
//     Num : Integer;
// 	ca : Real;
// Begin
// 	Write 255; 
// 	Read Num;
// 	Write 255;
// 	Read Num;
// 	Sum := Num1 + Num2;
// 	Write Sum;
// 	Read ca;
// End

program funcoes;
const TAM = 10;
type vetor = array[15] of integer;
var A, C : real; result, B, D : integer; E : vetor;
function integer fatorial(a:integer;)
	var i : integer;
begin
	i := 1;
	result:=1;
	while i < a
	begin
		result:=result*i;
		i:=i+1;
	end;
end

real exp(a: real; b: real;)
var i : integer;
begin
	i := 1;
	result := a;

	if b = 0 then
	begin
		result := 1;
	end
	else
	begin
		while i < b
		begin
			result := a;
			i := i + 1;
		end;
	end;
end

integer maior(a : vetor;)
var i : integer;
begin
	i := 0;
	result := a[0];
	while i < 15
	begin
		if a[i] > result then
		begin
			result := a[i];
		end;
	end;
end	
begin
	A:=A;
	B := fatorial(A);
	C := exp(A, A);
	D := maior(E);
End