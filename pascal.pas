program funcoes;
const TAM = 10;
type vetor = array[15] of integer;
var A, B, C, D : integer; E : vetor;
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
			result := a * a;
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
	A:=TAM;
	B := fatorial(A);
	C := exp(A,B);
	D := maior(E);
End